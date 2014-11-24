/// <reference path='../../configuration/application.ts' />

/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/model/Decision.ts' />
/// <reference path='../domain/model/Mapping.ts' />
/// <reference path='../domain/model/RequestTemplate.ts' />
/// <reference path='../domain/model/PPTAccount.ts' />
/// <reference path='../domain/model/ProjectPlanningTool.ts' />

/// <reference path='../domain/repository/MappingRepository.ts' />
/// <reference path='../domain/repository/DecisionRepository.ts' />
/// <reference path='../domain/repository/OptionRepository.ts' />
/// <reference path='../domain/repository/DecisionKnowledgeSystemRepository.ts' />
/// <reference path='../domain/repository/PPTAccountRepository.ts' />

/// <reference path='../service/TemplateProcesser.ts' />

module app.application {
	'use strict';

	export enum ExportWizardSteps {
		ToolSelection, DataSelection, Transformation
	}

	export class TransmissionController {
		mappingRepository: app.domain.repository.core.MappingRepository;
		$scope: any;

		constructor($scope, $location, persistenceService, authenticationService, $http) {
			this.$scope = $scope;
			var self = this;

			$scope.ExportWizardSteps = ExportWizardSteps;
			$scope.currentWizardStep = ExportWizardSteps.ToolSelection;

			$scope.ApplicationState = app.application.ApplicationState;
			$scope.operationState = app.application.ApplicationState.waiting;

			$scope.targetPPTAccount = null;
			$scope.requestTemplate = null;
			$scope.pptProject = "TEST"; //TODO: revert

			$scope.pptAccountRequestTemplates = [];
			$scope.decisions = [];
			$scope.orderedMappings = {};
			$scope.decisionMappings = {};
			$scope.pptAccounts = [];
			$scope.requestTemplates = [];
			$scope.transmitNodes = {};
			$scope.exportRequests = [];
			$scope.transformationErrors = [];

			var processors: { [index: string]: any } = {};

			var mappingRepository = persistenceService['mappingRepository'];
			var pptAccountRepository: app.domain.repository.ppt.PPTAccountRepository = persistenceService['pptAccountRepository'];
			var decisionRepository: app.domain.repository.dks.DecisionRepository = persistenceService['decisionRepository'];
			var optionRepository: app.domain.repository.dks.OptionRepository = persistenceService['optionRepository'];
			var decisionKnowledgeSystemRepository: app.domain.repository.dks.DecisionKnowledgeSystemRepository = persistenceService['decisionKnowledgeSystemRepository'];
			var requestTemplateRepository = persistenceService['requestTemplateRepository'];
			var projectRepository = persistenceService['projectRepository'];
			var projectPlanningToolRepository = persistenceService['projectPlanningToolRepository'];
			var processorRepository = persistenceService['processorRepository'];


			$scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 5 seconds
				if($scope.operationState == app.application.ApplicationState.pending) {
					$scope.operationState = app.application.ApplicationState.failed;
					$scope.$apply();
				}
			}, 5000);

			requestTemplateRepository.findAll(function(success, requestTemplates){
				$scope.requestTemplates = requestTemplates;

				pptAccountRepository.findAll(function(success, pptAccounts) {
					$scope.pptAccounts = pptAccounts;
					if (pptAccounts.length == 1) {
						$scope.targetPPTAccount = pptAccounts[0];
						$scope.setTarget($scope.targetPPTAccount);
					}

					projectRepository.findAll(function(	success, projects){
						$scope.projects = projects;
						$scope.currentProject = projects[0] || null;

						processorRepository.findAll(function(success, processorList){
							self.evaluateProcessors(processorList, processors);

							decisionKnowledgeSystemRepository.findAll(function(success, items) {
								$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

								decisionRepository.host = $scope.currentDks.url;
								optionRepository.host = $scope.currentDks.url;
								decisionRepository.findAllWithNodesAndSubNodes('alternatives', optionRepository, function(success, items){
									$scope.decisions = items;

									// fill decisions sorted by problem into decisionMappings
									self.orderDecisionsByProblem($scope);

									mappingRepository.findAll(function(success, items) {
										self.orderMappingsAndSubMappings(items, $scope.orderedMappings);

										setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
										self.findDecisionsWithMappings($scope.orderedMappings, $scope.decisionMappings);
									});
								});
							});
						});
					});
				});
			});

			$scope.setPPTProject = function(name: string) {
				$scope.pptProject = name;
			};

			$scope.setTarget = function(pptAccount: app.domain.model.ppt.PPTAccount) {
				$scope.targetPPTAccount = pptAccount;

				if(pptAccount.ppt) {
					requestTemplateRepository.findByPropertyId('ppt', pptAccount.ppt, function(success: boolean, items: app.domain.model.ppt.RequestTemplate[]) {
						$scope.pptAccountRequestTemplates = items;
						if(items.length==1) {
							$scope.requestTemplate = items[0];
						}
					}, true);
				}
			};

			$scope.decisionChildrenVisibilityState = [];
			$scope.toggleVisibilityState = function(index:number) {
				if($scope.decisionChildrenVisibilityState[index]) {
					$scope.decisionChildrenVisibilityState[index] = !$scope.decisionChildrenVisibilityState[index];
				} else {
					$scope.decisionChildrenVisibilityState[index] = true;
				}
			};

			$scope.getRequiredTableRowsForDecision=function(decisionGroup) {
				var rows:number = 0;
				Object.keys(decisionGroup.decisions).forEach(function (deKey) {
					rows = rows + 1; // No root element for subtasks
					var decisionElement = decisionGroup.decisions[deKey];
					Object.keys(decisionElement.mappings).forEach(function (mKey) {
						rows = rows + 1; // Decision Tasks
						var decisionMapping = decisionElement.mappings[mKey];
					});
					Object.keys(decisionElement.alternatives).forEach(function (aKey) {
						var alternativeElement = decisionElement.alternatives[aKey];
						rows = rows + 1; // Alternative
						Object.keys(alternativeElement.mappings).forEach(function (amKey) {
							rows = rows + 1; // Alternative Tasks
							var alternativeMapping = alternativeElement.mappings[amKey];
						});
					});
				});
				return rows;
			};

			// Creates a simpler hierarchy containing only: decision mappings and decision groups in the first index and all mappings in the second
			$scope.flattenDecisionAndOptionSelection= function (decisionMappings) {
				var rows = [];
				var lastProblem = null;
				var lastDecision = null;
				var lastAlternative = null;
				Object.keys(decisionMappings).forEach(function (dmKey) {
					var decisionGroup = decisionMappings[dmKey];
					Object.keys(decisionGroup.decisions).forEach(function (deKey) {
						var decisionElement = decisionGroup.decisions[deKey];
						rows.push({
							problem: decisionGroup,
							firstProblem: lastProblem != decisionGroup,
							decision: decisionElement,
							firstDecision: lastDecision != decisionElement,
							alternative: null,
							firstAlternative: lastAlternative != null,
							mapping: null
						});
						lastProblem = decisionGroup;
						lastDecision = decisionElement;
						lastAlternative = null;
						Object.keys(decisionElement.mappings).forEach(function (mKey) {
							var decisionMapping = decisionElement.mappings[mKey];
							rows.push({
								problem: decisionGroup,
								firstProblem: false,
								decision: decisionElement,
								firstDecision: false,
								alternative: null,
								firstAlternative: false,
								mapping: decisionMapping
							});
						});
						Object.keys(decisionElement.alternatives).forEach(function (aKey) {
							var alternativeElement = decisionElement.alternatives[aKey];
							Object.keys(alternativeElement.mappings).forEach(function (amKey) {
								var alternativeMapping = alternativeElement.mappings[amKey];
								rows.push({
									problem: decisionGroup,
									firstProblem: false,
									decision: decisionElement,
									firstDecision: false,
									alternative: alternativeElement,
									firstAlternative: lastAlternative != alternativeMapping,
									mapping: alternativeMapping
								});
								lastAlternative = alternativeMapping;
							});
						});
					});
				});
				return rows;
			};

			$scope.processTaskTemplates = function() {
				Object.keys($scope.decisionMappings).forEach(
					function(dgKey) {
						var decisionGroup: {
							decisions: {
								[index: number]: {
									decisions: app.domain.model.dks.Decision;
									mappings: { [index: number]: app.domain.model.core.Mapping }
								}
							};
							decisionsToExport: { [index: number]: boolean };
							problem: app.domain.model.dks.Problem
						};
					decisionGroup = $scope.decisionMappings[dgKey];

					// decisions
					Object.keys(decisionGroup.decisions).forEach(function(deKey) {
						var taskTemplatesToExport = decisionGroup.decisions[deKey].taskTemplatesToExport;
						self.addTaskTemplatesOfSelectedDecisionsToTransmissionNodes(decisionGroup, deKey, taskTemplatesToExport, $scope);
						// alternatives
						Object.keys(decisionGroup.decisions[deKey].alternatives).forEach(function(aeKey) {
							self.addTaskTemplatesOfSelectedAlternativesToTransmissionNodes(decisionGroup, deKey, aeKey, taskTemplatesToExport, $scope);
						});
					});
				});

				// parse templates
				Object.keys($scope.transmitNodes).forEach(function(dKey){
					var node = $scope.transmitNodes[dKey].node;
					var exportRequest = <any>null;

					Object.keys($scope.transmitNodes[dKey].mappings).forEach(function(tKey){
						exportRequest = self.renderRequestTemplates($scope, dKey, tKey, node, authenticationService, processors, exportRequest);
					});

					Object.keys($scope.transmitNodes[dKey].subNodes).forEach(function(aKey){
						self.renderSubRequestTemplate($scope, dKey, aKey, authenticationService, processors, exportRequest);
					});
				});
			};

			$scope.transmit = function() {
				$scope.transmitOne($scope.exportRequests, 0, null);
			};

			// Angular mixes request at near the same time, so serialize them
			$scope.transmitOne = function(exportRequests, index, subIndex) {
				if(index < exportRequests.length) {
					var exportRequest;
					if(subIndex == null) {
						var exportRequest = exportRequests[index];
					} else {
						var exportRequest = exportRequests[index].subRequests[subIndex];
					}

					var templateProcessor = new app.service.TemplateProcesser({ parentRequestData: exportRequests[index].requestData || null }, exportRequest.requestBody, processors);
					try {
						exportRequest.requestBody = templateProcessor.processSecondary();
					} catch (error) {
						$scope.transformationErrors.push("Errors occured during executing processors. Please check the code of your processors!");
					}

					var nextRequest = index+1;
					var nextSubRequest:number = null;
					if(exportRequests[index].subRequests && subIndex < exportRequests[index].subRequests.length-1) {
						nextRequest = index;
						nextSubRequest = (subIndex == null) ? 0 : subIndex+1;
					}
					exportRequest.exportState = app.application.ApplicationState.pending;
					projectPlanningToolRepository.transmitTasks(exportRequest, $scope.targetPPTAccount, $scope.requestTemplate.url, $scope.currentProject, function(success, data) {
						if(success) {
							exportRequest.exportState = app.application.ApplicationState.successful;
							exportRequest.requestData = data;
							exportRequest.requestPrint = JSON.stringify(data);
							$scope.transmitOne(exportRequests, nextRequest, nextSubRequest);
						} else {
							exportRequest.exportState = app.application.ApplicationState.failed;
							exportRequest.requestData = data;
							exportRequest.requestPrint = JSON.stringify(data);
							$scope.transmitOne(exportRequests, nextRequest, nextSubRequest);
						}
					});
				}
			};

			$scope.openRequestDetail = null;
			$scope.toggleRequestDetails = function(detail) {
				$scope.openRequestDetail = ($scope.openRequestDetail == detail) ? null : detail;
			};

			$scope.nextStep = function() {
				$scope.currentWizardStep++;
			};
		}

		orderMappingsAndSubMappings(mappings: app.domain.model.core.Mapping[], targetCollection: any) {
			mappings.forEach(function (currentMapping) {
				if (currentMapping.taskTemplate.parent == null) {
					if (!targetCollection[currentMapping.id]) {
						targetCollection[currentMapping.id] = { mapping: null, subMappings: {}, subMappingsToExport: []};
					}
					targetCollection[currentMapping.id].mapping = currentMapping;

				} else { // find parent mappings
					var parentTaskTemplateId = currentMapping.taskTemplate.parent.id;
					mappings.forEach(function (mapping) {
						if (mapping.taskTemplate.id == parentTaskTemplateId) {
							if (!targetCollection[mapping.id]) {
								targetCollection[mapping.id] = { mapping: null, subMappings: {}, subMappingsToExport: []};
							}
							targetCollection[mapping.id].subMappings[currentMapping.id] = currentMapping;
						}
					});
				}
			});
		}

		evaluateProcessors(processorList, processors) {
			processorList.forEach(function (processor) {
				"use strict";

				// evaluate processor from text -- eval is a critical function because of security
				// but it gives the user the most powerful processor functionality
				try {
					var processorCode:string = null;

					var code = '(function () { return ' + processor.code + ' })()';
					processorCode = eval.call(null, code);

					processors[processor.name] = processorCode;
				} catch (e) {
					console.error(processor.name + "() processor is not valid code!");
					// who cares. It's the problem of the user, if he writes incorrect processors
				}
			});
		}

		orderDecisionsByProblem($scope) {
			for (var di in $scope.decisions) {
				var decision = $scope.decisions[di];
				if (decision && decision.template) {
					if (!$scope.decisionMappings[decision.template.id]) {
						$scope.decisionMappings[decision.template.id] = { problem: decision.template, decisions: {} };
					}
					$scope.decisionMappings[decision.template.id]['decisions'][decision.id] = {
						decision: decision,
						taskTemplatesToExport: {},
						rootElementForSubNodes: null,
						mappings: {},
						alternatives: {}
					};
					// fill alternatives into decisionMappings[decision][alternatives]
					for (var ai in decision.alternatives) {
						var alternative = decision.alternatives[ai];
						if (alternative && alternative.template) {
							$scope.decisionMappings[decision.template.id]['decisions'][decision.id]['alternatives'][alternative.id] = {
								alternative: alternative,
								alternativeTemplate: alternative.template,
								mappings: {}
							};
						}
					}
				}
			}
		}

		// TODO: refactor all functions using $scope.decisionMappings after this function to user decisionElement.mappings[i].mapping instead of decisionElement.mappings[i]
		findDecisionsWithMappings(mappingCollection, decisionMappingCollection) {
			for (var mi in mappingCollection) {
				var mappingElement = mappingCollection[mi];
				// only add mapping, if decision exist
				if (decisionMappingCollection[mappingElement.mapping.dksNode]) {
					for (var dmi in decisionMappingCollection[mappingElement.mapping.dksNode]['decisions']) {
						var decisionElement = decisionMappingCollection[mappingElement.mapping.dksNode]['decisions'][dmi];
						decisionElement.mappings[mappingElement.mapping.id] = mappingElement;
					}
					// find alternatives with mappings
				} else {
					for (var pi in decisionMappingCollection) {
						for (var di in decisionMappingCollection[pi]['decisions']) {
							for (var ai in decisionMappingCollection[pi]['decisions'][di]['alternatives']) {
								var alternativeElement = decisionMappingCollection[pi]['decisions'][di]['alternatives'][ai];
								// if the decision is solved - take only the chosen alternative, otherwise take all
								if (alternativeElement.alternative.template.id == mappingElement.mapping.dksNode &&
									(decisionMappingCollection[pi]['decisions'][di].decision.state != "Solved" ||
										alternativeElement.alternative.state == "Chosen")) {
									alternativeElement.mappings[mappingElement.mapping.id] = mappingElement;
								}
							}
						}
					}
				}
			}
		}

		renderSubRequestTemplate($scope, dKey, aKey, authenticationService, processors, exportRequest) {
			var subNode = $scope.transmitNodes[dKey].subNodes[aKey].node;

			Object.keys($scope.transmitNodes[dKey].subNodes[aKey].mappings).forEach(function (atKey) {
				var mapping = $scope.transmitNodes[dKey].subNodes[aKey].mappings[atKey];

				var exportDecisionData = {
					node: subNode,
					taskTemplate: mapping.taskTemplate,
					currentUser: authenticationService.loggedInUser,
					project: $scope.currentProject,
					pptProject: $scope.pptProject,
					mappings: $scope.decisionMappings
				};

				var templateProcessor = new app.service.TemplateProcesser(exportDecisionData, $scope.requestTemplate.requestBodyTemplate, processors);
				var renderedTemplate;
				try {
					renderedTemplate = templateProcessor.process();


					var currentSubRequest = {
						requestBody: renderedTemplate,
						node: subNode,
						taskTemplate: mapping.taskTemplate,
						exportState: app.application.ApplicationState.waiting
					};
					if (exportRequest) {
						if (!exportRequest.subRequests) {
							exportRequest.subRequests = [];
						}
						exportRequest.subRequests.push(currentSubRequest);
					} else {
						$scope.exportRequests.push(currentSubRequest);
					}
				} catch (error) {
					$scope.transformationErrors.push("Errors occured during executing processors. Please check the code of your processors!");
				}
			});
		}

		renderRequestTemplates($scope, dKey, tKey, node, authenticationService, processors, exportRequest) {
			var mapping = $scope.transmitNodes[dKey].mappings[tKey];

			var exportDecisionData = {
				node: node,
				taskTemplate: mapping.taskTemplate,
				currentUser: authenticationService.loggedInUser,
				project: $scope.currentProject,
				pptProject: $scope.pptProject,
				mappings: $scope.decisionMappings
			};

			var templateProcessor = new app.service.TemplateProcesser(exportDecisionData, $scope.requestTemplate.requestBodyTemplate, processors);
			var renderedTemplate;
			try {
				renderedTemplate = templateProcessor.process();
				var currentRequest = {
					requestBody: renderedTemplate,
					node: node,
					taskTemplate: mapping.taskTemplate,
					exportState: app.application.ApplicationState.waiting
				};
				if ($scope.transmitNodes[dKey].rootElementForSubNodes == mapping) {
					exportRequest = currentRequest;
				}
				$scope.exportRequests.push(currentRequest);
			} catch (error) {
				$scope.transformationErrors.push("Errors occured during executing processors. Please check the code of your processors!");
			}
			return exportRequest;
		}

		addTaskTemplatesOfSelectedAlternativesToTransmissionNodes(decisionGroup, deKey, aeKey, taskTemplatesToExport, $scope) {
			var alternative:app.domain.model.dks.Alternative = decisionGroup.decisions[deKey].alternatives[aeKey].alternative;

			Object.keys(decisionGroup.decisions[deKey].alternatives[aeKey].mappings).forEach(function (amKey) {
				if (taskTemplatesToExport[amKey] && taskTemplatesToExport[amKey] === true) {
					var mapping:app.domain.model.core.Mapping = decisionGroup.decisions[deKey].alternatives[aeKey].mappings[amKey];

					// transform propertyValues list to dictionary to allow simple access using processor variables
					if (!mapping.taskTemplate['attributes']) {
						mapping.taskTemplate['attributes'] = {};
						mapping.taskTemplate.properties.forEach(function (taskPropertyValue, index) {
							mapping.taskTemplate['attributes'][taskPropertyValue.property.name.toLowerCase()] = taskPropertyValue.value;
						});
					}

					if ($scope.transmitNodes[deKey]) {
						if (!$scope.transmitNodes[deKey].subNodes[aeKey]) {
							$scope.transmitNodes[deKey].subNodes[aeKey] = { node: alternative, type: app.domain.model.dks.Option, mappings: []}
						}
						$scope.transmitNodes[deKey].subNodes[aeKey].mappings.push(mapping);
					} else {
						if (!$scope.transmitNodes[aeKey]) {
							$scope.transmitNodes[aeKey] = { node: alternative, type: app.domain.model.dks.Option, mappings: [], subNodes: {} };
						}
						$scope.transmitNodes[aeKey].mappings.push(mapping);
					}
				}
			});
		}

		addTaskTemplatesOfSelectedDecisionsToTransmissionNodes(decisionGroup, deKey, taskTemplatesToExport, $scope) {
			var decision:app.domain.model.dks.Decision = decisionGroup.decisions[deKey].decision;

			Object.keys(decisionGroup.decisions[deKey].mappings).forEach(function (mKey) {
				if (taskTemplatesToExport[mKey] && taskTemplatesToExport[mKey] === true) {
					var mapping:app.domain.model.core.Mapping = decisionGroup.decisions[deKey].mappings[mKey];

					// transform propertyValues list to dictionary to allow simple access using processor variables
					if (!mapping.taskTemplate['attributes']) {
						mapping.taskTemplate['attributes'] = {};
						mapping.taskTemplate.properties.forEach(function (taskPropertyValue, index) {
							mapping.taskTemplate['attributes'][taskPropertyValue.property.name.toLowerCase()] = taskPropertyValue.value;
						});
					}

					if (!$scope.transmitNodes[deKey]) {
						$scope.transmitNodes[deKey] = { node: decision, type: app.domain.model.dks.Decision, mappings: [], subNodes: {} };
					}
					$scope.transmitNodes[deKey].mappings.push(mapping);
					if (mapping == decisionGroup.decisions[deKey].rootElementForSubNodes) {
						$scope.transmitNodes[deKey].rootElementForSubNodes = mapping;
					}
				}
			});
		}
	}
}