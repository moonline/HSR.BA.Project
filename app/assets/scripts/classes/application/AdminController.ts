/// <reference path='../../configuration/application.ts' />

/// <reference path='../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../domain/model/RequestTemplate.ts' />
/// <reference path='../domain/model/PPTAccount.ts' />

/// <reference path='../domain/repository/TaskPropertyRepository.ts' />

/// <reference path='../application/ApplicationState.ts' />


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
			var requestTemplateRepository = persistenceService['requestTemplateRepository'];
			var projectRepository = persistenceService['projectRepository'];

			$scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 4 seconds
				if($scope.operationState == app.application.ApplicationState.pending) {
					$scope.operationState = app.application.ApplicationState.failed;
					$scope.$apply();
				}
			}, 4000);
			taskPropertyRepository.findAll(function(taskProperties) {
				$scope.taskProperties = taskProperties;

				// prevent request mix of angular -> call sync instead of parallel async
				pptAccountRepository.findAll(function(pptAccounts) {
					$scope.pptAccounts = pptAccounts;

					requestTemplateRepository.findAll(function(requestTemplates){
						$scope.requestTemplates = requestTemplates;

						projectRepository.findAll(function(projects){
							$scope.currentProject = projects[0];
							setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
						});
					});
				});
			});

			$scope.projectPlanningTools =[];
			// TODO: replace with api call
			var ppt = new app.domain.model.ppt.ProjectPlanningTool("Redmine");
			ppt.id = 1;
			$scope.projectPlanningTools.push(ppt);
			/*configuration.projectPlanningTools.forEach(function(pptConfig: any) {
				projectPlanningTools.push(new app.domain.model.ppt.ProjectPlanningTool(pptConfig.url, pptConfig.account, pptConfig.password))
			});*/

			//$scope.requestTemplates.push(new app.domain.model.ppt.RequestTemplate("Example", null, '{\n\t"fields": {\n\t\t"project": {\n\t\t\t"key": "TEST"\n\t\t},\n\t\t"assignee": "${assignee}",\n\t\t"description": "${description}",\n\t\t"issuetype": {\n\t\t\t"name": "${type}"\n\t\t}\n\t}\n}'));


			/* request templates */
			$scope.addRequestTemplate = function(ppt: app.domain.model.ppt.ProjectPlanningTool, url: string, requestBody: string) {
				var newRequestTemplate = new app.domain.model.ppt.RequestTemplate(ppt, url, requestBody);
				newRequestTemplate.project = $scope.currentProject;
				(<any>newRequestTemplate).requestTemplate = newRequestTemplate.requestBody;

				$scope.operationState = app.application.ApplicationState.saving;
				requestTemplateRepository.add(newRequestTemplate, function(success: boolean, item: app.domain.model.ppt.RequestTemplate){
					if(success) {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					}
				})
			};

			$scope.updateRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
				(<any>requestTemplate).requestTemplate = requestTemplate.requestBody;

				$scope.operationState = app.application.ApplicationState.saving;
				requestTemplateRepository.update(requestTemplate, function(success: boolean, item: app.domain.model.ppt.RequestTemplate){
					if(success) {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					}
				})
			};

			$scope.removeRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
				$scope.operationState = app.application.ApplicationState.saving;
				requestTemplateRepository.remove(requestTemplate, function(success: boolean){
					if(success) {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { $scope.operationState = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					}
				})
			};


			/* task properties */
			$scope.createTaskProperty = function(newTaskPropertyName: string) {
				taskPropertyRepository.add(new app.domain.model.core.TaskProperty(newTaskPropertyName), function(status, property) {});
			};

			$scope.renameTaskProperty = function(property: app.domain.model.core.TaskProperty, newName: string) {
				if(property && newName) {
					property.name = newName;
					taskPropertyRepository.update(property, function(status, property) {});
				}
			};


			/* ppt accounts */
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