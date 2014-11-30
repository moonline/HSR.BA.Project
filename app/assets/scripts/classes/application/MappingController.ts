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
		$scope: any;
		problemRepository: app.domain.repository.dks.ProblemRepository;
		alternativeRepository: app.domain.repository.dks.AlternativeRepository;
		taskPropertyRepository: app.domain.repository.core.TaskPropertyRepository;
		taskTemplateRepository: app.domain.repository.core.TaskTemplateRepository;
		mappingRepository: app.domain.repository.core.MappingRepository;
		decisionKnowledgeRepository: app.domain.repository.dks.DecisionKnowledgeSystemRepository;
		settings: any;

		constructor($scope, persistenceService) {
			this.$scope = $scope;
			this.settings = configuration.settings;

			this.problemRepository = persistenceService['problemRepository'];
			this.alternativeRepository = persistenceService['alternativeRepository'];
			this.taskPropertyRepository = persistenceService['taskPropertyRepository'];
			this.taskTemplateRepository =  persistenceService['taskTemplateRepository'];
			this.mappingRepository = persistenceService['mappingRepository'];
			this.decisionKnowledgeRepository = persistenceService['decisionKnowledgeSystemRepository'];

			$scope.LoadingStatus = app.application.ApplicationState;
			$scope.ApplicationState = app.application.ApplicationState;

			$scope.currentMappings = [];
			$scope.taskTemplates = [];
			$scope.problemListChildrenVisibilityState = [];
			$scope.currentTaskTemplate = null;
			$scope.hasTaskTemplateChanged = false;

			/* problems */
			$scope.setCurrentDksNode = this.setCurrentDksNode.bind(this);
			$scope.toggleVisibilityState = this.toggleVisibilityState.bind(this);

			/* task templates */
			$scope.notYetUsed = this.notYetUsed.bind(this);
			$scope.isNotSubtask = this.isNotSubtask.bind(this);
			$scope.isNotSelf = this.isNotSelf.bind(this); // scope?
			$scope.isParentTask = this.isParentTask.bind(this); // scope?

			$scope.setCurrentTaskTemplate = this.setCurrentTaskTemplate.bind(this);
			$scope.updateWithCorrectParent = this.updateWithCorrectParent.bind(this);
			$scope.findTaskTemplateInList = this.findTaskTemplateInList.bind(this); // scope?
			$scope.createNewTaskTemplate = this.createNewTaskTemplate.bind(this);
			$scope.addPropertyValue = this.addPropertyValue.bind(this);
			$scope.setTaskTemplateSavingCompletedStatus = this.setTaskTemplateSavingCompletedStatus.bind(this);
			$scope.removePropertyValue = this.removePropertyValue.bind(this);
			$scope.forceUpdateTaskTemplate = this.forceUpdateTaskTemplate.bind(this);
			$scope.updateTaskTemplate = this.updateTaskTemplate.bind(this);
			$scope.taskTemplateChanged = this.taskTemplateChanged.bind(this);

			/* mappings */
			$scope.mapTaskTemplate = this.mapTaskTemplate.bind(this);
			$scope.removeMapping = this.removeMapping.bind(this);
			$scope.hasMappingFor = this.hasMappingFor.bind(this);

			this.loadEntitiesFromRepository();
		}

		/**
		 * Load all entities synchronous from repository to prevent Angular response mix up
		 */
		loadEntitiesFromRepository() {
			var scope = this.$scope;
			var taskPropertyRepository = this.taskPropertyRepository;
			var decisionKnowledgeRepository = this.decisionKnowledgeRepository;
			var problemRepository = this.problemRepository;
			var alternativeRepository = this.alternativeRepository;
			var settings = this.settings;

			this.$scope.taskTemplateLoadingStatus = app.application.ApplicationState.pending;
			this.$scope.mappingsLoadingStatus = app.application.ApplicationState.waiting;
			
			// there is a problem if Angular fires two requests nearly at the same time.
			// Sometimes Angular mixes up the two requests and return the false data from $http.get().
			// So wait with the second request until the first terminated
			// This seems to be a bug in Angular
			this.taskTemplateRepository.findAll(function (success, taskTemplates) {
				if (success) {
					scope.taskTemplates = taskTemplates;
					setTimeout(() => {
						scope.taskTemplateLoadingStatus = app.application.ApplicationState.successful;
						scope.$apply();
					}, settings.messageBoxDelay);
				} else {
					setTimeout(() => {
						scope.taskTemplateLoadingStatus = app.application.ApplicationState.failed;
						scope.$apply();
					}, settings.messageBoxDelay);
				}

				taskPropertyRepository.findAll(function (success, taskProperties) {
					scope.taskProperties = taskProperties;

					scope.problems = [];
					scope.currentDksNode = null;
					scope.problemsLoadingStatus = app.application.ApplicationState.waiting;
					decisionKnowledgeRepository.findAll(function (success, items) {
						scope.currentDks = <app.domain.model.dks.DecisionKnowledgeSystem>items[0];

						scope.problemsLoadingStatus = app.application.ApplicationState.pending;
						problemRepository.host = scope.currentDks.url;
						alternativeRepository.host = scope.currentDks.url;
						problemRepository.findAllWithNodesAndSubNodes<app.domain.model.dks.Alternative>('alternatives', alternativeRepository, function (success, items) {
							if (success) {
								scope.problems = items;
								setTimeout(() => {
									scope.problemsLoadingStatus = app.application.ApplicationState.successful;
									scope.$apply();
								}, settings.messageBoxDelay);
							} else {
								setTimeout(() => {
									scope.problemsLoadingStatus = app.application.ApplicationState.failed;
									scope.$apply();
								}, settings.messageBoxDelay);
							}
						});
					});
				});
			});
		}

		setCurrentDksNode(problem) :void {
			if(problem) {
				var scope = this.$scope;
				this.$scope.currentDksNode = problem;

				this.$scope.mappingsLoadingStatus = app.application.ApplicationState.pending;
				this.mappingRepository.findByDksNode(problem, function(success, mappings) {
					if(success) {
						scope.currentMappings = mappings;
						setTimeout(() => { scope.mappingsLoadingStatus = app.application.ApplicationState.successful; scope.$apply(); }, configuration.settings.messageBoxDelay);
					} else {
						setTimeout(() => { scope.mappingsLoadingStatus = app.application.ApplicationState.failed; scope.$apply(); }, configuration.settings.messageBoxDelay);
					}
				});
			}
		}

		toggleVisibilityState(index:number):void {
			if(this.$scope.problemListChildrenVisibilityState[index]) {
				this.$scope.problemListChildrenVisibilityState[index] = !this.$scope.problemListChildrenVisibilityState[index];
			} else {
				this.$scope.problemListChildrenVisibilityState[index] = true;
			}
		}

		/**
		 * filter already used properties
		 */
 		notYetUsed() {
			var scope = this.$scope;

			return function( item ) {
				if(scope.currentTaskTemplate) {
					return !scope.currentTaskTemplate.hasProperty(item);
				} else {
					return true;
				}
			};
		}


		/**
		 * filter Task Templates that are a Sub Task
		 */
		isNotSubtask() {
			return function (item) {
				return item.parent === null;
			};
		}

		/**
		 * filter itself
		 */
		isNotSelf() {
			var scope = this.$scope;

			return function (item) {
				return item !== scope.currentTaskTemplate;
			};
		}

		isParentTask(potentialParent:app.domain.model.core.TaskTemplate): boolean {
			for (var i = 0; i < this.$scope.taskTemplates.length; i++) {
				if (this.$scope.taskTemplates[i].parent && (this.$scope.taskTemplates[i].parent.id == potentialParent.id)) {
					return true;
				}
			}
			return false;
		}

		setCurrentTaskTemplate(taskTemplate):void {
			this.$scope.updateWithCorrectParent(taskTemplate);
			this.$scope.currentTaskTemplate = taskTemplate;
		}

		updateWithCorrectParent(toUpdateEntity):void {
			if(toUpdateEntity.hasOwnProperty('parent')) {
				toUpdateEntity.parent = this.$scope.findTaskTemplateInList(toUpdateEntity.parent);
			}
		}

		/**
		 * Finds the correct object instance for the given project to select it in the list
		 */
		findTaskTemplateInList(expectedParent:app.domain.model.core.TaskTemplate):app.domain.model.core.TaskTemplate {
			if (!expectedParent) return expectedParent;
			for (var index = 0; index < this.$scope.taskTemplates.length; ++index) {
				if (this.$scope.taskTemplates[index].id == expectedParent.id) {
					return this.$scope.taskTemplates[index];
				}
			}
			return expectedParent;
		}

		createNewTaskTemplate(name: string):void {
			var scope = this.$scope;

			var newTaskTemplate: app.domain.model.core.TaskTemplate = new app.domain.model.core.TaskTemplate(name);
			this.$scope.taskTemplateSavingStatus = app.application.ApplicationState.saving;
			this.taskTemplateRepository.add(newTaskTemplate, function(success, item) {
				scope.setTaskTemplateSavingCompletedStatus(success);
				if(success) { scope.currentTaskTemplate = item; }
			});
		}

		addPropertyValue(property: app.domain.model.core.TaskProperty, value: string):void {
			var scope = this.$scope;

			if(this.$scope.currentTaskTemplate) {
				var taskPropertyValue: app.domain.model.core.TaskPropertyValue = new app.domain.model.core.TaskPropertyValue(property, value);
				(<app.domain.model.core.TaskTemplate>this.$scope.currentTaskTemplate).addProperty(taskPropertyValue);
				this.$scope.taskTemplateSavingStatus = app.application.ApplicationState.saving;
				this.taskTemplateRepository.addPropertyValue(this.$scope.currentTaskTemplate, taskPropertyValue, function(success, item){
					scope.currentTaskTemplate = item;
					scope.setTaskTemplateSavingCompletedStatus(success);
				});
			}
		}

		setTaskTemplateSavingCompletedStatus(success: boolean):void {
			var scope = this.$scope;
			var settings = this.settings;

			if(success) {
				this.$scope.taskTemplateSavingStatus = app.application.ApplicationState.successful;

				setTimeout(() => { scope.taskTemplateSavingStatus = null; scope.$apply(); }, settings.successDelay);
			} else {
				this.$scope.taskTemplateSavingStatus = app.application.ApplicationState.failed;
			}
		}

		removePropertyValue(propertyValue: app.domain.model.core.TaskPropertyValue):void {
			var scope = this.$scope;

			if(this.$scope.currentTaskTemplate) {
				this.$scope.currentTaskTemplate.removeProperty(propertyValue);
				this.$scope.taskTemplateSavingStatus = app.application.ApplicationState.saving;
				this.taskTemplateRepository.removePropertyValue(this.$scope.currentTaskTemplate, propertyValue, function(success, taskTemplate){
					scope.setTaskTemplateSavingCompletedStatus(success);
				});
			}
		}

		forceUpdateTaskTemplate():void {
			this.$scope.taskTemplateChanged();
			this.$scope.updateTaskTemplate();
		}

		updateTaskTemplate():void {
			var instance = this;
			var scope = this.$scope;
			var taskTemplateRepository = this.taskTemplateRepository;

			if(this.$scope.hasTaskTemplateChanged == true) {
				this.$scope.hasTaskTemplateChanged = false;
				this.$scope.taskTemplateSavingStatus = app.application.ApplicationState.saving;
				taskTemplateRepository.update(this.$scope.currentTaskTemplate, function(success: boolean, item) {
					if(success) {
						scope.currentTaskTemplate = item;
						instance.updateWithCorrectParent(item);
						scope.setTaskTemplateSavingCompletedStatus(success);
					} else {
						scope.taskTemplateSavingStatus = app.application.ApplicationState.failed;
					}
				});
			}
		}

		taskTemplateChanged():void {
			this.$scope.hasTaskTemplateChanged = true;
		}

		mapTaskTemplate(taskTemplate: app.domain.model.core.TaskTemplate):void {
			var scope = this.$scope;
			var mappingRepository = this.mappingRepository;
			var settings = this.settings;

			if(this.$scope.currentDksNode) {
				this.$scope.mappingsSavingStatus = app.application.ApplicationState.saving;
				var newMapping: app.domain.model.core.Mapping = new app.domain.model.core.Mapping(this.$scope.currentDksNode.id, taskTemplate);
				mappingRepository.add(newMapping, function(success, item){
					mappingRepository.findByDksNode(scope.currentDksNode, function(success, mappings) {
						if(success) {
							scope.currentMappings = mappings;
							scope.mappingsSavingStatus = app.application.ApplicationState.successful;
							setTimeout(() => { scope.mappingsSavingStatus = null; scope.$apply(); }, settings.successDelay);
						} else {
							scope.mappingsSavingStatus = app.application.ApplicationState.failed;
						}
					});
				});
			}
		}

		removeMapping(mapping: app.domain.model.core.Mapping):void {
			var scope = this.$scope;
			var mappingRepository = this.mappingRepository;
			var settings = this.settings;
			
			this.$scope.mappingsSavingStatus = app.application.ApplicationState.saving;
			mappingRepository.remove(mapping, function(success) {
				mappingRepository.findByDksNode(scope.currentDksNode, function(success, mappings) {
					if(mappings) {
						scope.currentMappings = mappings;
						scope.mappingsSavingStatus = app.application.ApplicationState.successful;
						setTimeout(() => { scope.mappingsSavingStatus = null; scope.$apply(); }, settings.successDelay);
					} else {
						scope.mappingsSavingStatus = app.application.ApplicationState.failed;
					}
				});
			})
		}
		
		hasMappingFor(taskTemplate:app.domain.model.core.TaskTemplate):boolean {
			for (var i = 0; i < this.$scope.currentMappings.length; i++) {
				if (this.$scope.currentMappings[i].taskTemplate.id == taskTemplate.id) {
					return true;
				}
			}
			return false;
		}
	}
}