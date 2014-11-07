/// <reference path='../domain/model/Decision.ts' />
/// <reference path='../domain/model/Option.ts' />
/// <reference path='../domain/model/Mapping.ts' />
/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/model/TaskProperty.ts' />
/// <reference path='../domain/model/TaskPropertyValue.ts' />
/// <reference path='../domain/model/DecisionKnowledgeSystem.ts' />

/// <reference path='../domain/repository/ProblemRepository.ts' />
/// <reference path='../domain/repository/MappingRepository.ts' />
/// <reference path='../domain/repository/TaskTemplateRepository.ts' />
/// <reference path='../domain/repository/TaskPropertyRepository.ts' />

module app.application {
	'use strict';

	export class MappingController {
		private scope: any;

		constructor($scope, $location, $http, persistenceService) {
			var decisionRepository = persistenceService['decisionRepository'];

			// there is a problem if Angular fires two requests nearly at the same time.
			// Sometimes Angular mixes up the two requests and return the false data from $http.get().
			// So wait with the second request until the first terminated
			// This seems to be a bug in Angular
			var taskPropertyRepository = persistenceService['taskPropertyRepository'];
			var taskTemplateRepository =  persistenceService['taskTemplateRepository'];
			taskTemplateRepository.findAll(function(taskTemplates) {
				$scope.taskTemplates = taskTemplates;

				taskPropertyRepository.findAll(function(taskProperties) {
					$scope.taskProperties = taskProperties;
				});
			});


			var problemRepository: app.domain.repository.dks.ProblemRepository = persistenceService['problemRepository'];
			var mappingRepository: app.domain.repository.core.MappingRepository = persistenceService['mappingRepository'];

			persistenceService['decisionKnowledgeRepository'].findAll(function(items) {
				$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

				problemRepository.host = $scope.currentDks.address;
				problemRepository.findAll(function(items) {
					$scope.problems = items;
				});

				decisionRepository.host = $scope.currentDks.address;
				decisionRepository.findAll(function(items) {
					$scope.decisions = items;
				});
			});

			$scope.currentDecision = null;
			$scope.currentMapping = null;
			$scope.setCurrentDecision = function(decision) {
				$scope.currentDecision = decision;
				mappingRepository.findOneBy('decision', decision, function(mapping) {
					$scope.currentMapping = mapping;
				});
			};

			$scope.currentTaskTemplate = null;
			// filter already used properties
			$scope.notYetUsed = function() {
				return function( item ) {
					if($scope.currentTaskTemplate) {
						return !$scope.currentTaskTemplate.hasProperty(item);
					} else {
						return true;
					}
				};
			};

			$scope.setCurrentTaskTemplate = function(taskTemplate) {
				$scope.currentTaskTemplate = taskTemplate;
			};
			$scope.createNewTaskTemplate = function(name: string) {
				var newTaskTemplate: app.domain.model.core.TaskTemplate = new app.domain.model.core.TaskTemplate(name);
				taskTemplateRepository.add(newTaskTemplate, function(status, item) {
					if(status) { $scope.currentTaskTemplate = item; }
				});
			};
			$scope.addPropertyValue = function(property: app.domain.model.core.TaskProperty, value: string) {
				if($scope.currentTaskTemplate) {
					var taskPropertyValue: app.domain.model.core.TaskPropertyValue = new app.domain.model.core.TaskPropertyValue(property, value);
					(<app.domain.model.core.TaskTemplate>$scope.currentTaskTemplate).addProperty(taskPropertyValue);
					taskTemplateRepository.addPropertyValue($scope.currentTaskTemplate, taskPropertyValue, function(status, item){});
				}
			};
			$scope.removePropertyValue = function(propertyValue: app.domain.model.core.TaskPropertyValue) {
				if($scope.currentTaskTemplate) {
					$scope.currentTaskTemplate.removeProperty(propertyValue);
					taskTemplateRepository.removePropertyValue($scope.currentTaskTemplate, propertyValue, function(success, taskTemplate){});
				}
			};

			$scope.updateTaskTemplate = function() {
				taskTemplateRepository.update($scope.currentTaskTemplate, function(status, item){});
				taskTemplateRepository.updateProperties($scope.currentTaskTemplate, function(status){});
			};

			$scope.mapTaskTemplate = function(taskTemplate: app.domain.model.core.TaskTemplate) {
				if($scope.currentMapping) {
					$scope.currentMapping.addTaskTemplate(taskTemplate);
				} else if($scope.currentDecision) {
					var mapping: app.domain.model.core.Mapping = new app.domain.model.core.Mapping($scope.currentDecision);
					mapping.addTaskTemplate(taskTemplate);
					//mappingRepository.add(mapping, function(item){});
					$scope.currentMapping = mapping;
				}
			};

			$scope.createTaskProperty = function(newTaskPropertyName: string) {
				taskPropertyRepository.add(new app.domain.model.core.TaskProperty(newTaskPropertyName), function(status, property) {});
			}

			$scope.renameTaskProperty = function(property: app.domain.model.core.TaskProperty, newName: string) {
				if(property && newName) {
					property.name = newName;
					taskPropertyRepository.update(property, function(status, property) {});
				}
			}
		}
	}
}