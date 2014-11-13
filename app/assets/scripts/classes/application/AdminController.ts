/// <reference path='../../configuration/application.ts' />

/// <reference path='../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../domain/model/RequestTemplate.ts' />
/// <reference path='../domain/repository/TaskPropertyRepository.ts' />

/// <reference path='../application/ApplicationState.ts' />

/// <reference path='../domain/model/PPTAccount.ts' />

module app.application {
	'use strict';

	export class AdminController {
		$scope: any;
		authenticationService: app.service.AuthenticationService;

		constructor($scope, $location, $http, persistenceService, authenticationService) {
			this.authenticationService = authenticationService;
			$scope.ApplicationState = app.application.ApplicationState;
			$scope.operationState = app.application.ApplicationState.waiting;

			var pptAccountRepository = persistenceService['pptAccountRepository'];
			var taskPropertyRepository = persistenceService['taskPropertyRepository'];

			$scope.operationState = app.application.ApplicationState.pending;
			taskPropertyRepository.findAll(function(taskProperties) {
				$scope.taskProperties = taskProperties;

				// prevent request mix of angular
				pptAccountRepository.findAll(function(pptAccounts) {
					$scope.pptAccounts = pptAccounts;
					setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
				});
			});

			var ppts: app.domain.model.ppt.ProjectPlanningTool[] = [];
			/*configuration.projectPlanningTools.forEach(function(pptConfig: any) {
				ppts.push(new app.domain.model.ppt.ProjectPlanningTool(pptConfig.url, pptConfig.account, pptConfig.password))
			});*/
			$scope.requestTemplates = [];
			$scope.requestTemplates.push(new app.domain.model.core.RequestTemplate("Example", null, '{\n\t"fields": {\n\t\t"project": {\n\t\t\t"key": "TEST"\n\t\t},\n\t\t"assignee": "${assignee}",\n\t\t"description": "${description}",\n\t\t"issuetype": {\n\t\t\t"name": "${type}"\n\t\t}\n\t}\n}'));


			$scope.addRequestTemplate = function(name: string, requestBody: string) {
				$scope.requestTemplates.push(new app.domain.model.core.RequestTemplate(name, null, requestBody));
			};
			$scope.updateRequestTemplate = function(requestTemplate: app.domain.model.core.RequestTemplate) {
				// update persistence
			};
			$scope.removeRequestTemplate = function(requestTemplate: app.domain.model.core.RequestTemplate) {
				$scope.requestTemplates.splice($scope.requestTemplates.indexOf(requestTemplate),1);
				// update persistence
			};


			$scope.createTaskProperty = function(newTaskPropertyName: string) {
				taskPropertyRepository.add(new app.domain.model.core.TaskProperty(newTaskPropertyName), function(status, property) {});
			};

			$scope.renameTaskProperty = function(property: app.domain.model.core.TaskProperty, newName: string) {
				if(property && newName) {
					property.name = newName;
					taskPropertyRepository.update(property, function(status, property) {});
				}
			};


			$scope.createPPTAccount = function(pptUrl: string, userName: string, password: string, ppt: app.domain.model.ppt.ProjectPlanningTool) {
				var pptAccount: app.domain.model.ppt.PPTAccount = new app.domain.model.ppt.PPTAccount(
					authenticationService.currentUser, userName, pptUrl, ppt
				);
				pptAccount.pptPassword = password;
				$scope.operationState = app.application.ApplicationState.saving;
				pptAccountRepository.add(pptAccount, function(success: boolean, item: app.domain.model.ppt.PPTAccount) {
					if(success) {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					}
				});
			};

			$scope.updatePPTAccount = function(pptAccount: app.domain.model.ppt.PPTAccount) {
				// TODO remove this hack after api fix
				(<any>pptAccount).ppt = 1;
				$scope.operationState = app.application.ApplicationState.saving;
				pptAccountRepository.update(pptAccount, function(success, item) {
					if(success) {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					}
				});
			};

			$scope.removePPTAccount = function(pptAccount: app.domain.model.ppt.PPTAccount) {
				$scope.operationState = app.application.ApplicationState.saving;
				pptAccountRepository.remove(pptAccount, function(success){
					if(success) {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					}
				});
			}
		}
	}
}