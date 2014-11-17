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

	export enum ExportWizzardSteps {
		ToolSelection, DataSelection, Transformation
	}

	export class TransmissionController {
		mappingRepository: app.domain.repository.core.MappingRepository;
		$scope: any;

		constructor($scope, $location, persistenceService, authenticationService, $http) {
			this.$scope = $scope;
			$scope.ExportWizzardSteps = ExportWizzardSteps;
			$scope.currentWizzardStep = ExportWizzardSteps.ToolSelection;

			$scope.ApplicationState = app.application.ApplicationState;
			$scope.operationState = app.application.ApplicationState.waiting;

			$scope.targetPPTAccount = null;
			$scope.currentRequestTemplate = null;

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


			$scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 5 seconds
				if($scope.operationState == app.application.ApplicationState.pending) {
					$scope.operationState = app.application.ApplicationState.failed;
					$scope.$apply();
				}
			}, 5000);
			decisionKnowledgeRepository.findAll(function(success, items) {
				$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

				decisionRepository.host = $scope.currentDks.address;
				decisionRepository.findAll(function(success, items){
					$scope.decisions = items;

					for(var di in $scope.decisions) {
						var decision = $scope.decisions[di];
						if(!$scope.decisionMappings[decision.template.id]) {
							$scope.decisionMappings[decision.template.id] = { problem: decision.template, decisions: {} };
						}
						$scope.decisionMappings[decision.template.id]['decisions'][decision.id] = { decision: decision, taskTemplatesToExport: {}, mappings: {} };
					}

					mappingRepository.findAll(function(success, items) {
						$scope.mappings = items;

						pptAccountRepository.findAll(function(success, pptAccounts) {
							$scope.pptAccounts = pptAccounts;

							requestTemplateRepository.findAll(function(success, requestTemplates){
								$scope.requestTemplates = requestTemplates;

								setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
							});
						});

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
						console.log($scope.decisionMappings);
					});
				});
			});

			$scope.setTarget = function(pptAccount: app.domain.model.ppt.PPTAccount) {
				$scope.targetPPTAccount = pptAccount;

// TODO: remove this hack after ppt apiAccount api is fixed
var requestTemplate = '{\n\
	\t"fields": {\n\
		\t\t"project": {\n\
			\t\t\t"key": "TEST"\n\
		\t\t},\n\
		\t\t"title": "${taskTemplate.name}",\n\
		\t\t"assignee": "${currentUser.userName}",\n\
		\t\t"relatedDecision": "${decision.name}"\n\
	\t}\n\
}';
				$scope.currentRequestTemplate = new app.domain.model.ppt.RequestTemplate(pptAccount.ppt, 'localhost:9920', requestTemplate);

				/*if(ppt) {
					requestTemplateRepository.findOneBy('ppt', ppt, function(success: boolean, item: app.domain.model.ppt.RequestTemplate) {
						$scope.currentRequestTemplate = item;
					}, true);
				}*/
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
						$scope.exportRequests.push({ requestBody: templateProcessor.process(), decision: decision, taskTemplate: mapping.taskTemplate });
					});
				});
			};

			$scope.transmit = function() {

			};

			$scope.nextStep = function() {
				$scope.currentWizzardStep++;
			};

			/*$scope.url = "http://localhost:9920/rest/api/2/issue/";
			$scope.data = '{\n\t"fields": {\n\t\t"project": {\n\t\t\t"key": "TEST"\n\t\t},\n\t\t"assignee": "${assignee}",\n\t\t"description": "${description}",\n\t\t"issuetype": {\n\t\t\t"name": "${type}"\n\t\t}\n\t}\n}';
			$scope.output = [];*/

			/*$scope.render = function(text: string) {
				$scope.output = [];
				$scope.mappings.forEach(function(mapping){
					var decisionTaskTemplates = [];

					mapping.taskTemplates.forEach(function(taskTemplate){
						var propertyValues = taskTemplate.getPropertieValuesByProperty();
						console.log(propertyValues);
						var textToReplace = ""+text;

						var pattern = /\$\{\w*\}/igm;
						for(var match; match = pattern.exec(textToReplace); ) {
							var property: string = match[0].substring(2,match[0].length-1);
							var replaceLength:number = match[0].length;
							var index: number = match.index;
							var replacer:string = (propertyValues[property] != undefined) ? propertyValues[property].value : "";
							textToReplace = textToReplace.slice(0, index) + replacer + textToReplace.slice(index+replaceLength, textToReplace.length);
						}
						decisionTaskTemplates.push(textToReplace);
					});
					$scope.output.push(decisionTaskTemplates);
				});
			};*/

			/*$scope.transmit = function() {
				$scope.trasmitCount = 0;
				$scope.transmitSuccessfullCount = 0;
				$scope.output.forEach(function(decisionTemplates) {
					decisionTemplates.forEach(function(decisionTaskTemplate){
						$scope.trasmitCount++;
						$http.post($scope.url, decisionTaskTemplate).success(function() {
							$scope.transmitSuccessfullCount++;
						});
					});
				});
			};*/
		}
	}
}