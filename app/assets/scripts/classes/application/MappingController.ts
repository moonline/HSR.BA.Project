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

	export enum LoadingStatus { waiting, successful, failed, pending }

	export class MappingController {
		private scope: any;

		constructor($scope, $location, $http, persistenceService) {
			var messageBoxDelay = 1000; //ms
			$scope.LoadingStatus = LoadingStatus;
			var decisionRepository = persistenceService['decisionRepository'];

			// there is a problem if Angular fires two requests nearly at the same time.
			// Sometimes Angular mixes up the two requests and return the false data from $http.get().
			// So wait with the second request until the first terminated
			// This seems to be a bug in Angular
			var taskPropertyRepository = persistenceService['taskPropertyRepository'];
			var taskTemplateRepository =  persistenceService['taskTemplateRepository'];

			$scope.taskTemplates = [];
			$scope.taskTemplateLoadingStatus = LoadingStatus.pending;
			taskTemplateRepository.findAll(function(taskTemplates) {
				if(taskTemplates) {
					$scope.taskTemplates = taskTemplates;
					setTimeout(() => { $scope.taskTemplateLoadingStatus = LoadingStatus.successful; $scope.$apply(); }, messageBoxDelay);
				} else {
					setTimeout(() => { $scope.taskTemplateLoadingStatus = LoadingStatus.failed; $scope.$apply(); }, messageBoxDelay);
				}

				taskPropertyRepository.findAll(function(taskProperties) {
					$scope.taskProperties = taskProperties;
				});
			});


			var problemRepository: app.domain.repository.dks.ProblemRepository = persistenceService['problemRepository'];
			var mappingRepository: app.domain.repository.core.MappingRepository = persistenceService['mappingRepository'];

			$scope.problems = [];
			$scope.problemsLoadingStatus = LoadingStatus.waiting;
			persistenceService['decisionKnowledgeRepository'].findAll(function(items) {
				$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

				$scope.problemsLoadingStatus = LoadingStatus.pending;
				problemRepository.host = $scope.currentDks.address;
				problemRepository.findAll(function(items) {
					if(items) {
						$scope.problems = items;
						setTimeout(() => { $scope.problemsLoadingStatus = LoadingStatus.successful; $scope.$apply(); }, messageBoxDelay);
					} else {
						setTimeout(() => { $scope.problemsLoadingStatus = LoadingStatus.failed; $scope.$apply(); }, messageBoxDelay);
					}
				});

				decisionRepository.host = $scope.currentDks.address;
				decisionRepository.findAll(function(items) {
					if(items) {
						$scope.decisions = items;
					}
				});
			});

			$scope.currentDecision = null;
			$scope.currentMappings = [];
			$scope.mappingsLoadingStatus = LoadingStatus.waiting;

			$scope.setCurrentDecision = function(decision) {
				$scope.currentDecision = decision;

				$scope.mappingsLoadingStatus = LoadingStatus.pending;
				mappingRepository.findByDksNode(decision, function(mappings) {
					if(mappings) {
						$scope.currentMappings = mappings;
						setTimeout(() => { $scope.mappingsLoadingStatus = LoadingStatus.successful; $scope.$apply(); }, messageBoxDelay);
					} else {
						setTimeout(() => { $scope.mappingsLoadingStatus = LoadingStatus.failed; $scope.$apply(); }, messageBoxDelay);
					}
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
				if($scope.currentDecision) {
					$scope.mappingsLoadingStatus = LoadingStatus.pending;
					var newMapping: app.domain.model.core.Mapping = new app.domain.model.core.Mapping($scope.currentDecision, taskTemplate);
					mappingRepository.add(newMapping, function(item){
						mappingRepository.findByDksNode($scope.currentDecision, function(mappings) {
							if(mappings) {
								$scope.currentMappings = mappings;
								setTimeout(() => { $scope.mappingsLoadingStatus = LoadingStatus.successful; $scope.$apply(); }, messageBoxDelay);
							} else {
								setTimeout(() => { $scope.mappingsLoadingStatus = LoadingStatus.failed; $scope.$apply(); }, messageBoxDelay);
							}
						});
					});
				}
			};

			$scope.removeMapping = function(mapping: app.domain.model.core.Mapping) {
				$scope.mappingsLoadingStatus = LoadingStatus.pending;
				mappingRepository.remove(mapping, function() {
					mappingRepository.findByDksNode($scope.currentDecision, function(mappings) {
						if(mappings) {
							$scope.currentMappings = mappings;
							setTimeout(() => { $scope.mappingsLoadingStatus = LoadingStatus.successful; $scope.$apply(); }, messageBoxDelay);
						} else {
							setTimeout(() => { $scope.mappingsLoadingStatus = LoadingStatus.failed; $scope.$apply(); }, messageBoxDelay);
						}
					});
				})
			}
		}
	}
}