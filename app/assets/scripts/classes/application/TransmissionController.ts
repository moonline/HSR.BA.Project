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
		ToolSelection, DataSelection, Transformation, Transmitting
	}

	export class MappingInformation {
		constructor(decision:app.domain.model.dks.Decision,
					mapping:app.domain.model.core.Mapping,
					alternative:app.domain.model.dks.Option,
					possibleParents:app.domain.model.core.Mapping[],
					selectedParent:app.domain.model.core.Mapping) {
			this.decision = decision;
			this.mapping = mapping;
			this.alternative = alternative;
			this.possibleParents = possibleParents;
			this.selectedParent = selectedParent;
		}

		decision:app.domain.model.dks.Decision;
		mapping:app.domain.model.core.Mapping;
		shouldExport:boolean;
		alternative:app.domain.model.dks.Option;
		//noinspection JSUnusedGlobalSymbols
		possibleParents:app.domain.model.core.Mapping[];
		selectedParent:app.domain.model.core.Mapping;
	}

	export class TransmissionController {
		$scope:any;

		constructor($scope, $location, persistenceService, authenticationService, $http) {
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
			$scope.allMappingInformation = <MappingInformation[]>[];

			var processors:{ [index: string]: any } = {};

			var mappingRepository = persistenceService['mappingRepository'];
			var pptAccountRepository:app.domain.repository.ppt.PPTAccountRepository = persistenceService['pptAccountRepository'];
			var decisionRepository:app.domain.repository.dks.DecisionRepository = persistenceService['decisionRepository'];
			var optionRepository:app.domain.repository.dks.OptionRepository = persistenceService['optionRepository'];
			var decisionKnowledgeSystemRepository:app.domain.repository.dks.DecisionKnowledgeSystemRepository = persistenceService['decisionKnowledgeSystemRepository'];
			var requestTemplateRepository = persistenceService['requestTemplateRepository'];
			var projectRepository = persistenceService['projectRepository'];
			var projectPlanningToolRepository = persistenceService['projectPlanningToolRepository'];
			var processorRepository = persistenceService['processorRepository'];


			$scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 5 seconds
				if ($scope.operationState == app.application.ApplicationState.pending) {
					$scope.operationState = app.application.ApplicationState.failed;
					$scope.$apply();
				}
			}, 5000);

			requestTemplateRepository.findAll(function (success, requestTemplates) {
				$scope.requestTemplates = requestTemplates;

				pptAccountRepository.findAll(function (success, pptAccounts) {
					$scope.pptAccounts = pptAccounts;
					if (pptAccounts.length == 1) {
						$scope.targetPPTAccount = pptAccounts[0];
						$scope.setTarget($scope.targetPPTAccount);
					}

					projectRepository.findAll(function (success, projects) {
						$scope.projects = projects;
						$scope.currentProject = projects[0] || null;

						processorRepository.findAll(function (success, processorList) {
							evaluateProcessors(processorList, processors);

							decisionKnowledgeSystemRepository.findAll(function (success, items) {
								$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

								decisionRepository.host = $scope.currentDks.url;
								optionRepository.host = $scope.currentDks.url;
								decisionRepository.findAllWithNodesAndSubNodes('alternatives', optionRepository, function (success, items) {
									$scope.decisions = items;

									// fill decisions sorted by problem into decisionMappings
									orderDecisionsByProblem($scope);

									mappingRepository.findAll(function (success, items) {
										$scope.mappings = items;
										$scope.orderedMappings = orderMappingsAndSubMappings(items);

										setTimeout(() => {
											$scope.operationState = app.application.ApplicationState.successful;
											$scope.$apply();
										}, configuration.settings.messageBoxDelay);
										findDecisionsWithMappings($scope.orderedMappings, $scope.decisionMappings);
										fillAllMappingInformation();
									});
								});
							});
						});
					});
				});
			});

			$scope.setTarget = function (pptAccount:app.domain.model.ppt.PPTAccount) {
				$scope.targetPPTAccount = pptAccount;

				if (pptAccount.ppt) {
					requestTemplateRepository.findByPropertyId('ppt', pptAccount.ppt, function (success:boolean, items:app.domain.model.ppt.RequestTemplate[]) {
						$scope.pptAccountRequestTemplates = items;
						if (items.length == 1) {
							$scope.requestTemplate = items[0];
						}
					}, true);
				}
			};

			$scope.processTaskTemplates = function () {
				$scope.currentWizardStep = ExportWizardSteps.Transformation;
				getTaskTemplatesOfSelectedDecisionsAndAlternatives($scope.allMappingInformation).forEach(function (transmitNode:{
					node: app.domain.model.dks.DksNode;
					type: any;
					mappings: app.domain.model.core.Mapping[];
					subNodes: {[index:string]:{
						node: app.domain.model.dks.Option;
						type: any;
						mappings: app.domain.model.core.Mapping[]
					}}
				}) {
					var parentRequests:{[index: string]:{
						requestBody: any;
						node: app.domain.model.dks.DksNode;
						taskTemplate: app.domain.model.core.TaskTemplate;
						exportState: app.application.ApplicationState;
					}} = {};
					transmitNode.mappings.forEach(function (mapping:app.domain.model.core.Mapping) {
						parentRequests[transmitNode.node.id + "_" + mapping.taskTemplate.id] = renderRequestTemplates($scope, mapping, transmitNode.node, authenticationService, processors, null);
					});
					Object.keys(transmitNode.subNodes).forEach(function (subNodeKey) {
						var subNode = transmitNode.subNodes[subNodeKey];
						subNode.mappings.forEach(function (mapping:app.domain.model.core.Mapping) {
							renderRequestTemplates($scope, mapping, subNode.node, authenticationService, processors, parentRequests[transmitNode.node.id + "_" + mapping.taskTemplate.parent.id]);
						});
					});
				});
			};

			$scope.transmit = function () {
				$scope.currentWizardStep = ExportWizardSteps.Transmitting;
				transmitOne($scope.exportRequests, 0, null);
			};

			// Angular mixes request at near the same time, so serialize them
			function transmitOne(allRequestsToExport, requestIndex, subRequestIndex) {
				if (requestIndex < allRequestsToExport.length) {
					var currentRequest;
					var parentRequestData;
					if (subRequestIndex != null) { //is subRequest?
						currentRequest = allRequestsToExport[requestIndex].subRequests[subRequestIndex];
						parentRequestData = allRequestsToExport[requestIndex].requestData;
					} else {
						currentRequest = allRequestsToExport[requestIndex];
						parentRequestData = null;
					}

					var templateProcessor = new app.service.TemplateProcesser({parentRequestData: parentRequestData}, currentRequest.requestBody, processors);
					try {
						currentRequest.requestBody = templateProcessor.processSecondary();
					} catch (error) {
						$scope.transformationErrors.push("Errors occurred during executing processors. Please check the code of your processors!");
					}

					var nextRequestIndex:number;
					var nextSubRequestIndex:number;
					if (allRequestsToExport[requestIndex].subRequests && (subRequestIndex === null ? -1 : subRequestIndex) < allRequestsToExport[requestIndex].subRequests.length - 1) { //is there another subRequest?
						nextRequestIndex = requestIndex;
						nextSubRequestIndex = (subRequestIndex === null ? 0 : subRequestIndex + 1);
					} else {
						nextRequestIndex = requestIndex + 1;
						nextSubRequestIndex = null;
					}

					currentRequest.exportState = app.application.ApplicationState.pending;
					projectPlanningToolRepository.transmitTasks(currentRequest, $scope.targetPPTAccount, $scope.requestTemplate.url, $scope.currentProject, function (success, data) {
						currentRequest.exportState = success ? app.application.ApplicationState.successful : app.application.ApplicationState.failed;
						currentRequest.requestData = data;
						currentRequest.requestPrint = JSON.stringify(data);
						transmitOne(allRequestsToExport, nextRequestIndex, nextSubRequestIndex);
					});
				}
			}

			$scope.openRequestDetail = null;
			$scope.toggleRequestDetails = function (detail) {
				$scope.openRequestDetail = ($scope.openRequestDetail == detail) ? null : detail;
			};

			$scope.goToDataSelectionStep = function () {
				$scope.currentWizardStep = ExportWizardSteps.DataSelection;
			};

			$scope.selectUnselectAll = function (selected:boolean) {
				$scope.allMappingInformation.forEach(function (aMappingInformation:{ shouldExport: boolean; }) {
					aMappingInformation.shouldExport = selected;
				});
			};

			$scope.atLeastOneExportErrorExists = function ():boolean {
				for (var i = 0; i < $scope.allMappingInformation.length; i++) {
					if ($scope.exportErrorFor($scope.allMappingInformation[i])) {
						return true;
					}
				}
				return false;
			};

			$scope.exportErrorFor = function (aMappingInformation:MappingInformation) {
				if (aMappingInformation.selectedParent && aMappingInformation.shouldExport) {
					var parentMappingInformation = getParentMappingInformation($scope.allMappingInformation, aMappingInformation);
					if (parentMappingInformation) {
						//Check for parent Task availability
						if (!parentMappingInformation.shouldExport) {
							return "Parent is not selected for Export"
						}
						//Check for multiple Layers
						if (parentMappingInformation.selectedParent) {
							return "Parent is also a Sub-Task"
						}
					}
				}
				return null;
			};

			function getParentMappingInformation(allMappingInformation:MappingInformation[], childMappingInformation:MappingInformation):MappingInformation {
				for (var i = 0; i < allMappingInformation.length; i++) {
					var possibleParentMappingInformation = allMappingInformation[i];
					if (childMappingInformation.decision == possibleParentMappingInformation.decision &&
						childMappingInformation.selectedParent.dksNode == (possibleParentMappingInformation.alternative ? possibleParentMappingInformation.alternative.template.id : possibleParentMappingInformation.decision.template.id) &&
						childMappingInformation.selectedParent.taskTemplate.id == possibleParentMappingInformation.mapping.taskTemplate.id) {
						return possibleParentMappingInformation;
					}
				}
				return null;
			}

			function fillAllMappingInformation():void {
				//create map containing nodeIds/[mappings]
				var mappingsMap = {};
				$scope.mappings.forEach(function (mapping) {
					if (!mappingsMap[mapping.dksNode]) mappingsMap[mapping.dksNode] = [];
					mappingsMap[mapping.dksNode].push(mapping);
				});
				//fill $scope.allMappingInformation with all mappings for all existing decisions
				$scope.decisions.forEach(function (decision) {
					//add for the decision itself
					var mappingsForDecision = (mappingsMap[decision.template.id] || []);
					mappingsForDecision.forEach(function (mappingForDecision) {
						$scope.allMappingInformation.push(new MappingInformation(decision, mappingForDecision, null, findParentMappingAsArray(mappingForDecision, mappingsForDecision), findParentMapping(mappingForDecision, mappingsForDecision)));
					});
					//add for all alternatives of the decision
					decision.alternatives.forEach(function (alternative) {
						if (alternative && alternative.template) {
							(mappingsMap[alternative.template.id] || []).forEach(function (mappingForAlternative) {
								$scope.allMappingInformation.push(new MappingInformation(decision, mappingForAlternative, alternative, findParentMappingAsArray(mappingForAlternative, mappingsMap[alternative.template.id], getOnlyParents(mappingsForDecision)), findParentMapping(mappingForAlternative, mappingsMap[alternative.template.id])));
							});
						}
					});
				});
			}

			function getOnlyParents(mappings:app.domain.model.core.Mapping[]):app.domain.model.core.Mapping[] {
				var result:app.domain.model.core.Mapping[] = [];
				mappings.forEach(function (mapping) {
					if (!mapping.taskTemplate.parent) {
						result.push(mapping);
					}
				});
				return result;
			}

			function findParentMappingAsArray(mapping, possibleParentMappings, additionalParents = null):app.domain.model.core.Mapping[] {
				var result:app.domain.model.core.Mapping[] = [];
				var calculated = findParentMapping(mapping, possibleParentMappings);
				if (calculated) {
					result.push(calculated);
				}
				if (additionalParents) {
					additionalParents.forEach(function (additionalParent) {
						result.push(additionalParent);
					});
				}
				return result;
			}

			function findParentMapping(mapping, possibleParentMappings):app.domain.model.core.Mapping {
				var parentTaskTemplate = mapping.taskTemplate.parent;
				if (!parentTaskTemplate) return null;
				for (var i = 0; i < possibleParentMappings.length; i++) {
					if (possibleParentMappings[i].taskTemplate.id == parentTaskTemplate.id) {
						return possibleParentMappings[i];
					}
				}
				return null;
			}


			//creates a structure {parentMappingId: {mapping: parentMapping, subMappings: {subMappingId: subMapping}, subMappingsToExport: []}
			function orderMappingsAndSubMappings(mappings:app.domain.model.core.Mapping[]) {
				var targetCollection:any = {};
				mappings.forEach(function (currentMapping) {
					if (currentMapping.taskTemplate.parent == null) {
						if (!targetCollection[currentMapping.id]) {
							targetCollection[currentMapping.id] = {
								mapping: null,
								subMappings: {},
								subMappingsToExport: []
							};
						}
						targetCollection[currentMapping.id].mapping = currentMapping;

					} else { // find parent mappings
						var parentTaskTemplateId = currentMapping.taskTemplate.parent.id;
						mappings.forEach(function (mapping) {
							if (mapping.taskTemplate.id == parentTaskTemplateId) {
								if (!targetCollection[mapping.id]) {
									targetCollection[mapping.id] = {
										mapping: null,
										subMappings: {},
										subMappingsToExport: []
									};
								}
								targetCollection[mapping.id].subMappings[currentMapping.id] = currentMapping;
							}
						});
					}
				});
				return targetCollection;
			}

			function evaluateProcessors(processorList, processors) {
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

			function orderDecisionsByProblem($scope) {
				for (var di in $scope.decisions) {
					var decision = $scope.decisions[di];
					if (decision && decision.template) {
						if (!$scope.decisionMappings[decision.template.id]) {
							$scope.decisionMappings[decision.template.id] = {problem: decision.template, decisions: {}};
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
			function findDecisionsWithMappings(mappingCollection, decisionMappingCollection) {
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

			function renderRequestTemplates($scope, mapping:app.domain.model.core.Mapping, node:app.domain.model.dks.DksNode, authenticationService, processors, parentRequest):{
				requestBody: any;
				node: app.domain.model.dks.DksNode;
				taskTemplate: app.domain.model.core.TaskTemplate;
				exportState: app.application.ApplicationState;
			} {
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
					var currentRequest:{
						requestBody: any;
						node: app.domain.model.dks.DksNode;
						taskTemplate: app.domain.model.core.TaskTemplate;
						exportState: app.application.ApplicationState;
						subRequests: {
							requestBody: any;
							node: app.domain.model.dks.DksNode;
							taskTemplate: app.domain.model.core.TaskTemplate;
							exportState: app.application.ApplicationState;
						}[]
					} = {
						requestBody: renderedTemplate,
						node: node,
						taskTemplate: mapping.taskTemplate,
						exportState: app.application.ApplicationState.waiting,
						subRequests: []
					};
					if (parentRequest) {
						parentRequest.subRequests.push(currentRequest);
						return null;
					} else {
						$scope.exportRequests.push(currentRequest);
						return currentRequest;
					}
				} catch (error) {
					$scope.transformationErrors.push("Errors occurred during executing processors. Please check the code of your processors!");
				}
			}

			function getTaskTemplatesOfSelectedDecisionsAndAlternatives(allMappingInformation:MappingInformation[]):{
				node: app.domain.model.dks.DksNode;
				type: any;
				mappings: app.domain.model.core.Mapping[];
				subNodes: {[index:string]:{
					node: app.domain.model.dks.DksNode;
					type: any;
					mappings: app.domain.model.core.Mapping[]
				}}
			}[] {
				var ret:{[index:string]:{
					node: app.domain.model.dks.DksNode;
					type: any;
					mappings: app.domain.model.core.Mapping[];
					subNodes: {[index:string]:{
						node: app.domain.model.dks.DksNode;
						type: any;
						mappings: app.domain.model.core.Mapping[]
					}}
				}} = {};
				[true, false].forEach(function (sendParents) {
					allMappingInformation.forEach(function (aMappingInformation) {
						//should send now?
						if (aMappingInformation.shouldExport && ((aMappingInformation.selectedParent == null) == sendParents)) {
							var mapping:app.domain.model.core.Mapping = aMappingInformation.mapping;
							addAttributesFieldToMapping(mapping);
							var node:app.domain.model.dks.DksNode = aMappingInformation.alternative ? aMappingInformation.alternative : aMappingInformation.decision;
							var transmitNodeId:string = node.id + "_" + mapping.taskTemplate.id;
							if (aMappingInformation.selectedParent == null) {
								console.log("Adding parent mapping for " + node.name + ": Task " + mapping.taskTemplate.name + " [" + transmitNodeId + "]");
								if (!ret[transmitNodeId]) {
									ret[transmitNodeId] = {
										node: node,
										type: app.domain.model.dks.DksNode,
										mappings: [],
										subNodes: {}
									};
								}
								ret[transmitNodeId].mappings.push(mapping);
							} else {
								var parentTransmitNodeId:string = node.id + "_" + aMappingInformation.selectedParent.taskTemplate.id;
								console.log("Adding child mapping for " + node.name + ": Task " + mapping.taskTemplate.name + " with parent " + parentTransmitNodeId + " with available parents: " + Object.keys(ret));
								if (!ret[parentTransmitNodeId].subNodes[transmitNodeId]) {
									ret[parentTransmitNodeId].subNodes[transmitNodeId] = {
										node: node,
										type: app.domain.model.dks.DksNode,
										mappings: []
									}
								}
								ret[parentTransmitNodeId].subNodes[transmitNodeId].mappings.push(mapping);
							}
						}
					});
				});
				//converting object to array
				var finalRet = [];
				Object.keys(ret).forEach(function (key) {
					finalRet.push(ret[key]);
				});
				return finalRet;
			}

			// transform propertyValues list to dictionary to allow simple access using processor variables
			function addAttributesFieldToMapping(mapping) {
				if (!mapping.taskTemplate['attributes']) {
					mapping.taskTemplate['attributes'] = {};
					mapping.taskTemplate.properties.forEach(function (taskPropertyValue, index) {
						mapping.taskTemplate['attributes'][taskPropertyValue.property.name.toLowerCase()] = taskPropertyValue.value;
					});
				}
			}
		}
	}

}