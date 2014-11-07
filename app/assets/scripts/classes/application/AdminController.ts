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