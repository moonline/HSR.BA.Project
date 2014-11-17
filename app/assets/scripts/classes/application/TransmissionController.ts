/// <reference path='../../configuration/application.ts' />

/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/model/Decision.ts' />
/// <reference path='../domain/model/Mapping.ts' />
/// <reference path='../domain/model/RequestTemplate.ts' />
/// <reference path='../domain/model/PPTAccount.ts' />
/// <reference path='../domain/model/ProjectPlanningTool.ts' />

/// <reference path='../domain/repository/MappingRepository.ts' />
/// <reference path='../domain/repository/DecisionRepository.ts' />
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
			$scope.ExportWizardSteps = ExportWizardSteps;
			$scope.currentWizardStep = ExportWizardSteps.ToolSelection;

			$scope.ApplicationState = app.application.ApplicationState;
			$scope.operationState = app.application.ApplicationState.waiting;

			$scope.targetPPTAccount = null;
			$scope.currentRequestTemplate = null;

			$scope.pptAccountRequestTemplates = [];
			$scope.decisions = [];
			$scope.mappings = [];
			$scope.decisionMappings = {};
			$scope.pptAccounts = [];
			$scope.requestTemplates = [];
			$scope.exportDecisions = {};
			$scope.exportRequests = [];

			var mappingRepository = persistenceService['mappingRepository'];
			var pptAccountRepository: app.domain.repository.ppt.PPTAccountRepository = persistenceService['pptAccountRepository'];
			var decisionRepository: app.domain.repository.dks.DecisionRepository = persistenceService['decisionRepository'];
			var decisionKnowledgeRepository: app.domain.repository.dks.DecisionKnowledgeSystemRepository = persistenceService['decisionKnowledgeRepository'];
			var requestTemplateRepository = persistenceService['requestTemplateRepository'];
			var projectRepository = persistenceService['projectRepository'];
			var projectPlanningToolRepository = persistenceService['projectPlanningToolRepository'];


			$scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 5 seconds
				if($scope.operationState == app.application.ApplicationState.pending) {
					$scope.operationState = app.application.ApplicationState.failed;
					$scope.$apply();
				}
			}, 5000);

			pptAccountRepository.findAll(function(success, pptAccounts) {
				$scope.pptAccounts = pptAccounts;

				requestTemplateRepository.findAll(function(success, requestTemplates){
					$scope.requestTemplates = requestTemplates;

					projectRepository.findAll(function(success, projects){
						$scope.projects = projects;
						$scope.currentProject = projects[0] || null;

						decisionKnowledgeRepository.findAll(function(success, items) {
							$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

							decisionRepository.host = $scope.currentDks.address;
							decisionRepository.findAll(function(success, items){
								$scope.decisions = items;

								for(var di in $scope.decisions) {
									var decision = $scope.decisions[di];
									if($scope.decisions[di] && $scope.decisions[di].template) {
										if(!$scope.decisionMappings[decision.template.id]) {
											$scope.decisionMappings[decision.template.id] = { problem: decision.template, decisions: {} };
										}
										$scope.decisionMappings[decision.template.id]['decisions'][decision.id] = { decision: decision, taskTemplatesToExport: {}, mappings: {} };
									}
								}

								mappingRepository.findAll(function(success, items) {
									$scope.mappings = items;

									setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);

									for(var mi in $scope.mappings) {
										var mapping = $scope.mappings[mi];
										// only add mapping, if decision exist
										if($scope.decisionMappings[mapping.dksNode]) {
											for(var dmi in $scope.decisionMappings[mapping.dksNode]['decisions']) {
												var decisionElement = $scope.decisionMappings[mapping.dksNode]['decisions'][dmi];
												decisionElement.mappings[mapping.id] = mapping;
											}
										}
									}
								});
							});
						});
					});
				});
			});

			$scope.setRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
				$scope.currentRequestTemplate = requestTemplate;
			};

			$scope.setTarget = function(pptAccount: app.domain.model.ppt.PPTAccount) {
				$scope.targetPPTAccount = pptAccount;

				if(pptAccount.ppt) {
					requestTemplateRepository.findByPropertyId('ppt', pptAccount.ppt, function(success: boolean, items: app.domain.model.ppt.RequestTemplate[]) {
						$scope.pptAccountRequestTemplates = items;
					}, true);
				}
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

					Object.keys(decisionGroup.decisions).forEach(function(deKey) {
						var decision:app.domain.model.dks.Decision = decisionGroup.decisions[deKey].decision;

						Object.keys(decisionGroup.decisions[deKey].mappings).forEach(function(mKey) {
							if(decisionGroup.decisions[deKey].taskTemplatesToExport[mKey] && decisionGroup.decisions[deKey].taskTemplatesToExport[mKey] === true) {
								var mapping:app.domain.model.core.Mapping = decisionGroup.decisions[deKey].mappings[mKey];
								if(!$scope.exportDecisions[deKey]) {
									$scope.exportDecisions[deKey] = { decision: decision, mappings: [] };
								}
								$scope.exportDecisions[deKey].mappings.push(mapping);
							}
						});
					});
				});
				Object.keys($scope.exportDecisions).forEach(function(dKey){
					var decision = $scope.exportDecisions[dKey].decision;
					Object.keys($scope.exportDecisions[dKey].mappings).forEach(function(tKey){
						var mapping = $scope.exportDecisions[dKey].mappings[tKey];

						var exportDecisionData = { decision: decision, taskTemplate: mapping.taskTemplate, currentUser: authenticationService.loggedInUser };

						var templateProcessor = new app.service.TemplateProcesser(exportDecisionData, $scope.currentRequestTemplate.requestBody, {});
						var renderedTemplate = templateProcessor.process();
						$scope.exportRequests.push({
							requestBody: templateProcessor.process(),
							decision: decision,
							taskTemplate: mapping.taskTemplate,
							exportState: app.application.ApplicationState.waiting
						});
					});
				});
			};

			$scope.transmit = function() {
				$scope.transmitOne($scope.exportRequests, 0);
			};

			// Angular mixes request at near the same time, so serialize them
			$scope.transmitOne = function(exportRequests, index) {
				if(index < exportRequests.length) {
					var exportRequest = exportRequests[index];
					projectPlanningToolRepository.transmitTasks(exportRequest, $scope.targetPPTAccount, $scope.currentRequestTemplate.url, $scope.currentProject, function(success, data) {
						if(success) {
							exportRequest.exportState = app.application.ApplicationState.successful;
							$scope.transmitOne(exportRequests, index+1);
						} else {
							exportRequest.exportState = app.application.ApplicationState.failed;
							$scope.transmitOne(exportRequests, index+1);
						}
					});
				}
			};

			$scope.nextStep = function() {
				$scope.currentWizardStep++;
			};
		}
	}
}