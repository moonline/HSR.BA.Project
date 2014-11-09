/// <reference path='../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../domain/model/RequestTemplate.ts' />
/// <reference path='../domain/repository/TaskPropertyRepository.ts' />

module app.application {
	'use strict';

	export class AdminController {
		$scope: any;
		authenticationService: app.service.AuthenticationService;

		constructor($scope, $location, $http, persistenceService) {
			var taskPropertyRepository = persistenceService['taskPropertyRepository'];
			taskPropertyRepository.findAll(function(taskProperties) {
				$scope.taskProperties = taskProperties;
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
			$scope.updateRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
				// update persistence
			};
			$scope.removeRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
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
		}
	}
}