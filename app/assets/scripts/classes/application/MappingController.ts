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
/// <reference path='../application/ApplicationState.ts' />

module app.application {
	'use strict';

	export class MappingController {
		private scope: any;

		constructor($scope, $location, $http, persistenceService) {
			var messageBoxDelay = 1000; //ms
			$scope.LoadingStatus = app.application.ApplicationState;
			var decisionRepository = persistenceService['decisionRepository'];

			// there is a problem if Angular fires two requests nearly at the same time.
			// Sometimes Angular mixes up the two requests and return the false data from $http.get().
			// So wait with the second request until the first terminated
			// This seems to be a bug in Angular
			var taskPropertyRepository = persistenceService['taskPropertyRepository'];
			var taskTemplateRepository =  persistenceService['taskTemplateRepository'];

			$scope.taskTemplates = [];
			$scope.taskTemplateLoadingStatus = app.application.ApplicationState.pending;
			taskTemplateRepository.findAll(function(taskTemplates) {
				if(taskTemplates) {
					$scope.taskTemplates = taskTemplates;
					setTimeout(() => { $scope.taskTemplateLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, messageBoxDelay);
				} else {
					setTimeout(() => { $scope.taskTemplateLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, messageBoxDelay);
				}

				taskPropertyRepository.findAll(function(taskProperties) {
					$scope.taskProperties = taskProperties;
				});
			});


			var problemRepository: app.domain.repository.dks.ProblemRepository = persistenceService['problemRepository'];
			var mappingRepository: app.domain.repository.core.MappingRepository = persistenceService['mappingRepository'];

			$scope.problems = [];
			$scope.problemsLoadingStatus = app.application.ApplicationState.waiting;
			persistenceService['decisionKnowledgeRepository'].findAll(function(items) {
				$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

				$scope.problemsLoadingStatus = app.application.ApplicationState.pending;
				problemRepository.host = $scope.currentDks.address;
				problemRepository.findAll(function(items) {
					if(items) {
						$scope.problems = items;
						setTimeout(() => { $scope.problemsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, messageBoxDelay);
					} else {
						setTimeout(() => { $scope.problemsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, messageBoxDelay);
					}
				});

				decisionRepository.host = $scope.currentDks.address;
				decisionRepository.findAll(function(items) {
					if(items) {
						$scope.decisions = items;
					}
				});
			});

			$scope.currentProblem = null;
			$scope.currentMappings = [];
			$scope.mappingsLoadingStatus = app.application.ApplicationState.waiting;

			$scope.setCurrentProblem = function(decision) {
				$scope.currentProblem = decision;

				$scope.mappingsLoadingStatus = app.application.ApplicationState.pending;
				mappingRepository.findByDksNode(decision, function(mappings) {
					if(mappings) {
						$scope.currentMappings = mappings;
						setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, messageBoxDelay);
					} else {
						setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, messageBoxDelay);
					}
				});
			};


			$scope.problemListChildrenVisibilityState = [];
			$scope.toggleVisibilityState = function(index:number) {
				if($scope.problemListChildrenVisibilityState[index]) {
					$scope.problemListChildrenVisibilityState[index] = !$scope.problemListChildrenVisibilityState[index];
				} else {
					$scope.problemListChildrenVisibilityState[index] = true;
				}
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
				if($scope.currentProblem) {
					$scope.mappingsLoadingStatus = app.application.ApplicationState.pending;
					var newMapping: app.domain.model.core.Mapping = new app.domain.model.core.Mapping($scope.currentProblem, taskTemplate);
					mappingRepository.add(newMapping, function(item){
						mappingRepository.findByDksNode($scope.currentProblem, function(mappings) {
							if(mappings) {
								$scope.currentMappings = mappings;
								setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, messageBoxDelay);
							} else {
								setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, messageBoxDelay);
							}
						});
					});
				}
			};

			$scope.removeMapping = function(mapping: app.domain.model.core.Mapping) {
				$scope.mappingsLoadingStatus = app.application.ApplicationState.pending;
				mappingRepository.remove(mapping, function() {
					mappingRepository.findByDksNode($scope.currentProblem, function(mappings) {
						if(mappings) {
							$scope.currentMappings = mappings;
							setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, messageBoxDelay);
						} else {
							setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, messageBoxDelay);
						}
					});
				})
			}
		}
	}
}