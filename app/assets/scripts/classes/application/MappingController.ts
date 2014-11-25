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
/// <reference path='../domain/repository/AlternativeRepository.ts' />
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
			var alternativeRepository: app.domain.repository.dks.AlternativeRepository = persistenceService['alternativeRepository'];
			var taskPropertyRepository: app.domain.repository.core.TaskPropertyRepository = persistenceService['taskPropertyRepository'];
			var taskTemplateRepository: app.domain.repository.core.TaskTemplateRepository =  persistenceService['taskTemplateRepository'];
			var mappingRepository: app.domain.repository.core.MappingRepository = persistenceService['mappingRepository'];
			var decisionKnowledgeRepository: app.domain.repository.dks.DecisionKnowledgeSystemRepository = persistenceService['decisionKnowledgeSystemRepository'];

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

					$scope.problems = [];
					$scope.currentDksNode = null;
					$scope.problemsLoadingStatus = app.application.ApplicationState.waiting;
					decisionKnowledgeRepository.findAll(function(success, items) {
						$scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

						$scope.problemsLoadingStatus = app.application.ApplicationState.pending;
						problemRepository.host = $scope.currentDks.url;
						alternativeRepository.host = $scope.currentDks.url;
						problemRepository.findAllWithNodesAndSubNodes<app.domain.model.dks.Alternative>('alternatives', alternativeRepository, function(success, items) {
							if(success) {
								$scope.problems = items;
								setTimeout(() => { $scope.problemsLoadingStatus = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
							} else {
								setTimeout(() => { $scope.problemsLoadingStatus = app.application.ApplicationState.failed; $scope.$apply(); }, configuration.settings.messageBoxDelay);
							}
						});
					});
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
			// filter Task Templates that are a Sub Task
			$scope.isNotSubtask = function () {
				return function (item) {
					return item.parent === null;
				};
			};
			// filter itself
			$scope.isNotSelf = function () {
				return function (item) {
					return item !== $scope.currentTaskTemplate;
				};
			};

			$scope.isParentTask = function (potentialParent:app.domain.model.core.TaskTemplate) {
				for (var i = 0; i < $scope.taskTemplates.length; i++) {
					if ($scope.taskTemplates[i].parent && ($scope.taskTemplates[i].parent.id == potentialParent.id)) {
						return true;
					}
				}
				return false;
			};

			$scope.setCurrentTaskTemplate = function(taskTemplate) {
				$scope.updateWithCorrectParent(taskTemplate);
				$scope.currentTaskTemplate = taskTemplate;
			};

			$scope.updateWithCorrectParent = function (toUpdateEntity) {
				if(toUpdateEntity.hasOwnProperty('parent')) {
					toUpdateEntity.parent = $scope.findTaskTemplateInList(toUpdateEntity.parent);
				}
			};

			//Finds the correct object instance for the given project to select it in the list
			$scope.findTaskTemplateInList = function (expectedParent:app.domain.model.core.TaskTemplate) {
				if (!expectedParent) return expectedParent;
				for (var index = 0; index < $scope.taskTemplates.length; ++index) {
					if ($scope.taskTemplates[index].id == expectedParent.id) {
						return $scope.taskTemplates[index];
					}
				}
				return expectedParent;
			};


			$scope.createNewTaskTemplate = function(name: string) {
				var newTaskTemplate: app.domain.model.core.TaskTemplate = new app.domain.model.core.TaskTemplate(name);
				$scope.taskTemplateSavingStatus = app.application.ApplicationState.saving;
				taskTemplateRepository.add(newTaskTemplate, function(success, item) {
					$scope.setTaskTemplateSavingCompletedStatus(success);
					if(success) { $scope.currentTaskTemplate = item; }
				});
			};
			
			$scope.addPropertyValue = function(property: app.domain.model.core.TaskProperty, value: string) {
				if($scope.currentTaskTemplate) {
					var taskPropertyValue: app.domain.model.core.TaskPropertyValue = new app.domain.model.core.TaskPropertyValue(property, value);
					(<app.domain.model.core.TaskTemplate>$scope.currentTaskTemplate).addProperty(taskPropertyValue);
					$scope.taskTemplateSavingStatus = app.application.ApplicationState.saving;
					taskTemplateRepository.addPropertyValue($scope.currentTaskTemplate, taskPropertyValue, function(success, item){
						$scope.setTaskTemplateSavingCompletedStatus(success);
					});
				}
			};

			$scope.setTaskTemplateSavingCompletedStatus = function(success: boolean) {
				if(success) {
					$scope.taskTemplateSavingStatus = app.application.ApplicationState.successful;

					setTimeout(() => { $scope.taskTemplateSavingStatus = null; $scope.$apply(); }, configuration.settings.successDelay);
				}else{
					$scope.taskTemplateSavingStatus = app.application.ApplicationState.failed;
				}
			};
			
			$scope.removePropertyValue = function(propertyValue: app.domain.model.core.TaskPropertyValue) {
				if($scope.currentTaskTemplate) {
					$scope.currentTaskTemplate.removeProperty(propertyValue);
					$scope.taskTemplateSavingStatus = app.application.ApplicationState.saving;
					taskTemplateRepository.removePropertyValue($scope.currentTaskTemplate, propertyValue, function(success, taskTemplate){
						$scope.setTaskTemplateSavingCompletedStatus(success);
					});
				}
			};

			$scope.forceUpdateTaskTemplate = function() {
				$scope.taskTemplateChanged();
				$scope.updateTaskTemplate();
			};

			$scope.updateTaskTemplate = function() {
				if($scope.hasTaskTemplateChanged == true) {
					$scope.hasTaskTemplateChanged = false;
					$scope.taskTemplateSavingStatus = app.application.ApplicationState.saving;
					taskTemplateRepository.update($scope.currentTaskTemplate, function(success: boolean, item){
						if(success) {
							taskTemplateRepository.updateProperties($scope.currentTaskTemplate, function (success:boolean) {
								if(success) $scope.updateWithCorrectParent($scope.currentTaskTemplate);
								$scope.setTaskTemplateSavingCompletedStatus(success);
							});
						} else {
							$scope.taskTemplateSavingStatus = app.application.ApplicationState.failed;
						}
					});
				}
			};

			$scope.hasTaskTemplateChanged = false;

			$scope.taskTemplateChanged = function() {
				$scope.hasTaskTemplateChanged = true;
			};


			/* mappings */
			$scope.mapTaskTemplate = function(taskTemplate: app.domain.model.core.TaskTemplate) {
				if($scope.currentDksNode) {
					$scope.mappingsSavingStatus = app.application.ApplicationState.saving;
					var newMapping: app.domain.model.core.Mapping = new app.domain.model.core.Mapping($scope.currentDksNode.id, taskTemplate);
					mappingRepository.add(newMapping, function(success, item){
						mappingRepository.findByDksNode($scope.currentDksNode, function(success, mappings) {
							if(success) {
								$scope.currentMappings = mappings;
								$scope.mappingsSavingStatus = app.application.ApplicationState.successful;
								setTimeout(() => { $scope.mappingsSavingStatus = null; $scope.$apply(); }, configuration.settings.successDelay);
							} else {
								$scope.mappingsSavingStatus = app.application.ApplicationState.failed;
							}
						});
					});
				}
			};

			$scope.removeMapping = function(mapping: app.domain.model.core.Mapping) {
				$scope.mappingsSavingStatus = app.application.ApplicationState.saving;
				mappingRepository.remove(mapping, function(success) {
					mappingRepository.findByDksNode($scope.currentDksNode, function(success, mappings) {
						if(mappings) {
							$scope.currentMappings = mappings;
							$scope.mappingsSavingStatus = app.application.ApplicationState.successful;
							setTimeout(() => { $scope.mappingsSavingStatus = null; $scope.$apply(); }, configuration.settings.successDelay);
						} else {
							$scope.mappingsSavingStatus = app.application.ApplicationState.failed;
						}
					});
				})
			};

			$scope.hasMappingFor = function (taskTemplate:app.domain.model.core.TaskTemplate) {
				for (var i = 0; i < $scope.currentMappings.length; i++) {
					if ($scope.currentMappings[i].taskTemplate.id == taskTemplate.id) {
						return true;
					}
				}
				return false;
			};
		}
	}
}