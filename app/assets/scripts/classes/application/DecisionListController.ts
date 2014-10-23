/// <reference path='../domain/model/Decision.ts' />
/// <reference path='../domain/model/Option.ts' />
/// <reference path='../domain/model/Mapping.ts' />
/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/model/TaskProperty.ts' />
/// <reference path='../domain/model/TaskPropertyValue.ts' />
/// <reference path='../domain/model/DecisionKnowledgeSystem.ts' />
/// <reference path='../domain/repository/ProblemRepository.ts' />

module core {
	'use strict';

	export class DecisionListController {

		/**
		 * @inject
		 */
		public static $inject: string[] = [
			'$scope',
			'$location'
		];

		constructor($scope, $location, $http, persistenceService) {
			var decisionRepository = persistenceService['decisionRepository'];
			decisionRepository.findAll(function(items) {
				$scope.decisions = items;
			});

			var taskTemplateRepository = persistenceService['taskTemplateRepository'];
			taskTemplateRepository.findAll(function(taskTemplates) {
				$scope.taskTemplates = taskTemplates;
			});

			var taskPropertyRepository = persistenceService['taskPropertyRepository'];
			taskPropertyRepository.findAll(function(taskProperties) {
				$scope.taskProperties = taskProperties;
			});

			var mappingRepository = persistenceService['mappingRepository'];

			$scope.problems = {};
			persistenceService['decisionKnowledgeRepository'].findAll(function(items) {
				var currentDks:dks.DecisionKnowledgeSystem = <dks.DecisionKnowledgeSystem>items[0];
				var problemRepository: dks.ProblemRepository = persistenceService['factories'].createProblemRepository();
				problemRepository.findAll(function(items) {
					$scope.problems = items;
				});
			});

			$scope.currentDecision = null;
			$scope.currentMapping = null;
			$scope.setCurrentDecision = function(decision) {
				$scope.currentDecision = decision;
				mappingRepository.findOneByDecision(decision, function(mapping) {
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
			$scope.addPropertyValue = function(property) {
				if($scope.currentTaskTemplate) {
					var taskPropertyValue: TaskPropertyValue = new TaskPropertyValue(property, '');
					(<TaskTemplate>$scope.currentTaskTemplate).addProperty(taskPropertyValue);
				}
			};

			$scope.mapTaskTemplate = function(taskTemplate) {
				if($scope.currentMapping) {
					$scope.currentMapping.addTaskTemplate(taskTemplate);
				} else if($scope.currentDecision) {
					var mapping: Mapping = new Mapping($scope.currentDecision);
					mapping.addTaskTemplate(taskTemplate);
					mappingRepository.add(mapping);
					$scope.currentMapping = mapping;
				}
			};
		}
	}
}