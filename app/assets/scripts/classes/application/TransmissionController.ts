/// <reference path='../../configuration/application.ts' />

/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/model/Decision.ts' />
/// <reference path='../domain/model/Mapping.ts' />

/// <reference path='../domain/repository/MappingRepository.ts' />
/// <reference path='../domain/repository/DecisionRepository.ts' />
/// <reference path='../domain/repository/DecisionKnowledgeSystemRepository.ts' />
/// <reference path='../domain/repository/PPTAccountRepository.ts' />

module app.application {
	'use strict';

	export enum ExportWizzardSteps {
		ToolSelection, DataSelection, Transformation
	}

	export class TransmissionController {
		mappingRepository: app.domain.repository.core.MappingRepository;
		$scope: any;

		constructor($scope, $location, persistenceService, $http) {
			this.$scope = $scope;
			$scope.ExportWizzardSteps = ExportWizzardSteps;
			$scope.currentWizzardStep = ExportWizzardSteps.ToolSelection;

			$scope.ApplicationState = app.application.ApplicationState;
			$scope.operationState = app.application.ApplicationState.waiting;

			$scope.targetPPT = null;

			$scope.decisions = [];
			$scope.mappings = [];
			$scope.decisionMappings = {};
			$scope.pptAccounts = [];
			$scope.requestTemplates = [];

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

				//decisionRepository.host = $scope.currentDks.address;
				decisionRepository.proxy = null;
				decisionRepository.findAll(function(success, items){
					$scope.decisions = items;

					for(var di in $scope.decisions) {
						var decision = $scope.decisions[di];
						if(!$scope.decisionMappings[decision.template.id]) {
							$scope.decisionMappings[decision.template.id] = { problem: decision.template, decisions: {} };
						}
						$scope.decisionMappings[decision.template.id]['decisions'][decision.id] = { decision: decision, decisionsToExport: {}, mappings: {} };
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