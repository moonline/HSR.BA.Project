/// <reference path='../domain/model/Decision.ts' />
/// <reference path='../domain/model/Option.ts' />
/// <reference path='../domain/model/Mapping.ts' />
/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/model/TaskProperty.ts' />
/// <reference path='../domain/model/TaskPropertyValue.ts' />
/// <reference path='../domain/model/DecisionKnowledgeSystem.ts' />

/// <reference path='../domain/repository/ProblemRepository.ts' />
/// <reference path='../domain/repository/MappingRepository.ts' />

module core {
	'use strict';

	export class MappingController {
		constructor($scope, $location, $http, persistenceService) {
			var decisionRepository = persistenceService['decisionRepository'];

			var taskTemplateRepository = persistenceService['taskTemplateRepository'];
			taskTemplateRepository.findAll(function(taskTemplates) {
				$scope.taskTemplates = taskTemplates;
			});

			var taskPropertyRepository = persistenceService['taskPropertyRepository'];
			taskPropertyRepository.findAll(function(taskProperties) {
				$scope.taskProperties = taskProperties;
			});

			var problemRepository: dks.ProblemRepository = persistenceService['problemRepository'];
			var mappingRepository: MappingRepository = persistenceService['mappingRepository'];

			persistenceService['decisionKnowledgeRepository'].findAll(function(items) {
				$scope.currentDks = <dks.DecisionKnowledgeSystem>items[0];

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
			$scope.setCurrentTaskTemplate = function(taskTemplate) {
				$scope.currentTaskTemplate = taskTemplate;
			};
			$scope.createNewTaskTemplate = function() {
				var newTaskTemplate = new core.TaskTemplate('');
				taskTemplateRepository.add(newTaskTemplate);
				$scope.currentTaskTemplate = newTaskTemplate;
			};
			$scope.addPropertyValue = function(property: TaskProperty) {
				if($scope.currentTaskTemplate) {
					var taskPropertyValue: TaskPropertyValue = new TaskPropertyValue(property, '');
					(<TaskTemplate>$scope.currentTaskTemplate).addProperty(taskPropertyValue);
				}
			};

			$scope.mapTaskTemplate = function(taskTemplate: TaskTemplate) {
				if($scope.currentMapping) {
					$scope.currentMapping.addTaskTemplate(taskTemplate);
				} else if($scope.currentDecision) {
					var mapping: Mapping = new Mapping($scope.currentDecision);
					mapping.addTaskTemplate(taskTemplate);
					mappingRepository.add(mapping, function(item){});
					$scope.currentMapping = mapping;
				}
			};
		}
	}
}