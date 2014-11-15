/// <reference path='../../configuration/application.ts' />

/// <reference path='../domain/model/DksNode.ts' />
/// <reference path='../domain/model/Problem.ts' />
/// <reference path='../domain/model/Alternative.ts' />
/// <reference path='../domain/model/Mapping.ts' />
/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/model/TaskProperty.ts' />
/// <reference path='../domain/model/TaskPropertyValue.ts' />
/// <reference path='../domain/model/DecisionKnowledgeSystem.ts' />

/// <reference path='../domain/repository/ProblemRepository.ts' />
/// <reference path='../domain/repository/MappingRepository.ts' />
/// <reference path='../domain/repository/TaskTemplateRepository.ts' />
/// <reference path='../domain/repository/TaskPropertyRepository.ts' />
/// <reference path='../domain/repository/DecisionKnowledgeSystemRepository.ts' />

/// <reference path='../application/ApplicationState.ts' />

module app.application {
	'use strict';

	export class MappingController {
		private scope: any;

		constructor($scope, $location, $http, persistenceService) {
			$scope.LoadingStatus = app.application.ApplicationState;
			$scope.ApplicationState = app.application.ApplicationState;

			var problemRepository: app.domain.repository.dks.ProblemRepository = persistenceService['problemRepository'];
			var taskPropertyRepository: app.domain.repository.core.TaskPropertyRepository = persistenceService['taskPropertyRepository'];
			var taskTemplateRepository: app.domain.repository.core.TaskTemplateRepository =  persistenceService['taskTemplateRepository'];
			var mappingRepository: app.domain.repository.core.MappingRepository = persistenceService['mappingRepository'];
			var devisionKnowledgeRepository: app.domain.repository.dks.DecisionKnowledgeSystemRepository = persistenceService['decisionKnowledgeRepository'];

			$scope.taskTemplates = [];
			$scope.taskTemplateLoadingStatus = app.application.ApplicationState.pending;
			// there is a problem if Angular fires two requests nearly at the same time.
			// Sometimes Angular mixes up the two requests and return the false data from $http.get().
			// So wait with the second request until the first terminated
			// This seems to be a bug in Angular
			taskTemplateRepository.findAll(function(success, taskTemplates) {
				if(success) {
					$scope.taskTemplates = taskTemplates;
					setTimeout(() => { $scope.taskTemplateLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
				} else {
					setTimeout(() => { $scope.taskTemplateLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
				}

				taskPropertyRepository.findAll(function(success, taskProperties) {
					$scope.taskProperties = taskProperties;
				});
			});



			$scope.problems = [];
			$scope.currentDksNode = null;
			$scope.problemsLoadingStatus = app.application.ApplicationState.waiting;
			devisionKnowledgeRepository.findAll(function(success, items) {
				$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

				$scope.problemsLoadingStatus = app.application.ApplicationState.pending;
				problemRepository.host = $scope.currentDks.address;
				problemRepository.findAll(function(success, items) {
					if(success) {
						$scope.problems = items;
						setTimeout(() => { $scope.problemsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { $scope.problemsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					}
				});
			});

			$scope.currentMappings = [];
			$scope.mappingsLoadingStatus = app.application.ApplicationState.waiting;


			/* problems */
			$scope.setCurrentDksNode = function(problem) {
				$scope.currentDksNode = problem;

				$scope.mappingsLoadingStatus = app.application.ApplicationState.pending;
				mappingRepository.findByDksNode(problem, function(success, mappings) {
					if(success) {
						$scope.currentMappings = mappings;
						setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
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


			/* task templates */
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
				taskTemplateRepository.add(newTaskTemplate, function(success, item) {
					// TODO: add operationState
					if(success) { $scope.currentTaskTemplate = item; }
				});
			};
			
			$scope.addPropertyValue = function(property: app.domain.model.core.TaskProperty, value: string) {
				if($scope.currentTaskTemplate) {
					var taskPropertyValue: app.domain.model.core.TaskPropertyValue = new app.domain.model.core.TaskPropertyValue(property, value);
					(<app.domain.model.core.TaskTemplate>$scope.currentTaskTemplate).addProperty(taskPropertyValue);
					taskTemplateRepository.addPropertyValue($scope.currentTaskTemplate, taskPropertyValue, function(success, item){
						//TODO: add operationState
					});
				}
			};
			
			$scope.removePropertyValue = function(propertyValue: app.domain.model.core.TaskPropertyValue) {
				if($scope.currentTaskTemplate) {
					$scope.currentTaskTemplate.removeProperty(propertyValue);
					taskTemplateRepository.removePropertyValue($scope.currentTaskTemplate, propertyValue, function(success, taskTemplate){
						// TODO: add operationState
					});
				}
			};

			$scope.updateTaskTemplate = function() {
				// TODO: add operationState
				taskTemplateRepository.update($scope.currentTaskTemplate, function(status, item){});
				taskTemplateRepository.updateProperties($scope.currentTaskTemplate, function(status){});
			};


			/* mappings */
			$scope.mapTaskTemplate = function(taskTemplate: app.domain.model.core.TaskTemplate) {
				if($scope.currentDksNode) {
					$scope.mappingsLoadingStatus = app.application.ApplicationState.pending;
					var newMapping: app.domain.model.core.Mapping = new app.domain.model.core.Mapping($scope.currentDksNode.id, taskTemplate);
					// TODO: fix operationState
					mappingRepository.add(newMapping, function(success, item){
						mappingRepository.findByDksNode($scope.currentDksNode, function(success, mappings) {
							if(success) {
								$scope.currentMappings = mappings;
								setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
							} else {
								setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
							}
						});
					});
				}
			};

			$scope.removeMapping = function(mapping: app.domain.model.core.Mapping) {
				$scope.mappingsLoadingStatus = app.application.ApplicationState.pending;
				// TODO: add operationState
				mappingRepository.remove(mapping, function(success) {
					mappingRepository.findByDksNode($scope.currentDksNode, function(success, mappings) {
						if(mappings) {
							$scope.currentMappings = mappings;
							setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
						} else {
							setTimeout(() => { $scope.mappingsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
						}
					});
				})
			}
		}
	}
}