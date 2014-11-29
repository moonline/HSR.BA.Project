/// <reference path='../../configuration/application.ts' />

/// <reference path='../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../domain/model/RequestTemplate.ts' />
/// <reference path='../domain/model/Project.ts' />
/// <reference path='../domain/model/Processor.ts' />

/// <reference path='../domain/repository/TaskPropertyRepository.ts' />
/// <reference path='../domain/repository/RequestTemplateRepository.ts' />
/// <reference path='../domain/repository/ProjectRepository.ts' />
/// <reference path='../domain/repository/ProcessorRepository.ts' />
/// <reference path='../domain/repository/ProjectPlanningToolRepository.ts' />
/// <reference path='../domain/repository/DecisionKnowledgeSystemRepository.ts' />

/// <reference path='../application/ApplicationState.ts' />


module app.application {
	'use strict';

	export class AdminController {
		$scope: any;
		taskPropertyRepository: app.domain.repository.core.TaskPropertyRepository;
		requestTemplateRepository: app.domain.repository.ppt.RequestTemplateRepository;
		projectRepository: app.domain.repository.core.ProjectRepository;
		processorRepository: app.domain.repository.core.ProcessorRepository;
		projectPlanningToolRepository: app.domain.repository.ppt.ProjectPlanningToolRepository;
		decisionKnowledgeSystemRepository: app.domain.repository.dks.DecisionKnowledgeSystemRepository;
		settings: any;

		/**
		 * Controller for administration view
		 *
		 * @param $scope - Angular $scope
		 * @param persistenceService - Dictionary of repositories to load entities
		 */
		constructor($scope, persistenceService) {
			this.$scope = $scope;
			this.settings = configuration.settings;

			this.taskPropertyRepository = persistenceService['taskPropertyRepository'];
			this.requestTemplateRepository = persistenceService['requestTemplateRepository'];
			this.projectRepository = persistenceService['projectRepository'];
			this.processorRepository = persistenceService['processorRepository'];
			this.projectPlanningToolRepository = persistenceService['projectPlanningToolRepository'];
			this.decisionKnowledgeSystemRepository = persistenceService['decisionKnowledgeSystemRepository'];

			$scope.ApplicationState = app.application.ApplicationState;
			$scope.operationState = app.application.ApplicationState.waiting;

			$scope.hasToUpdateRequestTemplateChanged = false;
			$scope.hasToUpdatePropertyChanged = false;
			$scope.hasToUpdateDKSChanged = false;
			$scope.hasToUpdateProcessorChanged = false;
			$scope.addRequestTemplate = this.addRequestTemplate.bind(this);
			$scope.updateRequestTemplate = this.updateRequestTemplate.bind(this);
			$scope.removeRequestTemplate = this.removeRequestTemplate.bind(this);
			$scope.toUpdateRequestTemplateChanged = this.toUpdateRequestTemplateChanged.bind(this);

			$scope.createTaskProperty = this.createTaskProperty.bind(this);
			$scope.renameTaskProperty = this.renameTaskProperty.bind(this);
			$scope.toUpdatePropertyChanged = this.toUpdatePropertyChanged.bind(this);

			$scope.updateDKS = this.updateDKS.bind(this);

			$scope.toUpdateDKSChanged = this.toUpdateDKSChanged.bind(this);
			$scope.createProcessor = this.createProcessor.bind(this);
			$scope.updateProcessor = this.updateProcessor.bind(this);
			$scope.removeProcessor = this.removeProcessor.bind(this);

			$scope.toUpdateProcessorChanged = this.toUpdateProcessorChanged.bind(this);
			$scope.updateWithCorrectProjectAndPPT = this.updateWithCorrectProjectAndPPT.bind(this);
			$scope.findProjectInList = this.findProjectInList.bind(this);
			$scope.findPPTInList = this.findPPTInList.bind(this);

			this.loadEntitiesFromRepositories();
		}

		/**
		 * Load entities synchronous from repositories to prevent response mix by angular
		 */
		loadEntitiesFromRepositories() {
			var scope = this.$scope;
			var taskPropertyRepository = this.taskPropertyRepository;
			var requestTemplateRepository = this.requestTemplateRepository;
			var projectRepository = this.projectRepository;
			var processorRepository = this.processorRepository;
			var projectPlanningToolRepository = this.projectPlanningToolRepository;
			var decisionKnowledgeSystemRepository = this.decisionKnowledgeSystemRepository;
			var settings = this.settings;
			
			this.$scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 4 seconds
				if (scope.operationState == app.application.ApplicationState.pending) {
					scope.operationState = app.application.ApplicationState.failed;
					scope.$apply();
				}
			}, 4000);
			taskPropertyRepository.findAll(function (success, taskProperties) {
				scope.taskProperties = taskProperties;

				requestTemplateRepository.findAll(function (success, requestTemplates) {
					scope.requestTemplates = requestTemplates;

					processorRepository.findAll(function (success, processors) {
						scope.processors = processors;

						projectRepository.findAll(function (success, projects) {
							scope.projects = projects;
							scope.currentProject = projects[0];

							projectPlanningToolRepository.findAll(function (success, ppts) {
								scope.projectPlanningTools = ppts;

								decisionKnowledgeSystemRepository.findAll(function (success, dkss) {
									scope.dkss = dkss;

									setTimeout(() => {
										scope.operationState = app.application.ApplicationState.successful;
										scope.$apply();
									}, settings.messageBoxDelay);
								});
							});
						});
					});
				});
			});
		}

		addRequestTemplate(name: string, url: string, project: app.domain.model.core.Project, ppt: app.domain.model.ppt.ProjectPlanningTool, requestBodyTemplate: string):void {
			var instance = this;

			var newRequestTemplate = new app.domain.model.ppt.RequestTemplate(name, url, ppt, project, requestBodyTemplate);
			newRequestTemplate.project = this.$scope.currentProject;

			this.$scope.manageRequestTemplatesStatus = app.application.ApplicationState.saving;
			this.requestTemplateRepository.add(newRequestTemplate, function(success: boolean, item: app.domain.model.ppt.RequestTemplate){
				instance.setOperationFinishState(success, 'manageRequestTemplatesStatus');
			})
		}

		updateRequestTemplate(requestTemplate: app.domain.model.ppt.RequestTemplate):void {
			var instance = this;

			if(this.$scope.hasToUpdateRequestTemplateChanged) {
				this.$scope.hasToUpdateRequestTemplateChanged = false;

				this.$scope.manageRequestTemplatesStatus = app.application.ApplicationState.saving;
				this.requestTemplateRepository.update(requestTemplate, function(success: boolean, item: app.domain.model.ppt.RequestTemplate){
					instance.setOperationFinishState(success, 'manageRequestTemplatesStatus');
				})
			}
		}

		removeRequestTemplate(requestTemplate: app.domain.model.ppt.RequestTemplate):void {
			var instance = this;

			this.$scope.manageRequestTemplatesStatus = app.application.ApplicationState.saving;
			this.requestTemplateRepository.remove(requestTemplate, function(success: boolean){
				instance.setOperationFinishState(success, 'manageRequestTemplatesStatus');
			})
		}

		toUpdateRequestTemplateChanged():void {
			this.$scope.hasToUpdateRequestTemplateChanged = true;
		}

		createTaskProperty(newTaskPropertyName: string):void {
			var instance = this;

			this.$scope.managePropertiesStatus = app.application.ApplicationState.saving;
			this.taskPropertyRepository.add(new app.domain.model.core.TaskProperty(newTaskPropertyName), function(success, property) {
				instance.setOperationFinishState(success, 'managePropertiesStatus');
			});
		}

		renameTaskProperty(property: app.domain.model.core.TaskProperty):void {
			var instance = this;

			if(this.$scope.hasToUpdatePropertyChanged) {
				this.$scope.hasToUpdatePropertyChanged = false;
				this.$scope.managePropertiesStatus = app.application.ApplicationState.saving;
				this.taskPropertyRepository.update(property, function (success, property) {
					instance.setOperationFinishState(success, 'managePropertiesStatus');
				});
			}
		}

		toUpdatePropertyChanged() {
			this.$scope.hasToUpdatePropertyChanged = true;
		}

		updateDKS(dks: app.domain.model.dks.DecisionKnowledgeSystem):void {
			var instance = this;

			if(this.$scope.hasToUpdateDKSChanged) {
				this.$scope.hasToUpdateDKSChanged = false;
				this.$scope.manageDKSStatus = app.application.ApplicationState.saving;
				this.decisionKnowledgeSystemRepository.update(dks, function (success:boolean, item:app.domain.model.dks.DecisionKnowledgeSystem) {
					instance.setOperationFinishState(success, 'manageDKSStatus');
				})
			}
		}

		toUpdateDKSChanged() {
			this.$scope.hasToUpdateDKSChanged = true;
		}

		createProcessor(newProcessorName: string, newProcessorProject: app.domain.model.core.Project, newProcessorCode: string):app.domain.model.core.Processor {
			var instance = this;

			var processor: app.domain.model.core.Processor = new app.domain.model.core.Processor (newProcessorName, newProcessorProject, newProcessorCode);
			this.$scope.manageProcessorsStatus = app.application.ApplicationState.saving;
			this.processorRepository.add(processor, function(success: boolean, item: app.domain.model.core.Processor) {
				instance.setOperationFinishState(success, 'manageProcessorsStatus');
			});
			return processor;
		}

		updateProcessor(processor: app.domain.model.core.Processor):void {
			var instance = this;

			if(this.$scope.hasToUpdateProcessorChanged) {
				this.$scope.hasToUpdateProcessorChanged = false;
				this.$scope.manageProcessorsStatus = app.application.ApplicationState.saving;
				this.processorRepository.update(processor, function (success:boolean, item:app.domain.model.core.Processor) {
					instance.setOperationFinishState(success, 'manageProcessorsStatus');
				});
			}
		}

		removeProcessor(processor: app.domain.model.core.Processor):void {
			var instance = this;

			this.$scope.manageProcessorsStatus = app.application.ApplicationState.saving;
			this.processorRepository.remove(processor, function(success: boolean){
				instance.setOperationFinishState(success, 'manageProcessorsStatus');
			});
		}

		toUpdateProcessorChanged():void {
			this.$scope.hasToUpdateProcessorChanged = true;
		}

		updateWithCorrectProjectAndPPT(toUpdateEntity):void {
			if(toUpdateEntity.hasOwnProperty('ppt')) {
				toUpdateEntity.ppt = this.$scope.findPPTInList(toUpdateEntity.ppt);
			}
			if(toUpdateEntity.hasOwnProperty('project')) {
				toUpdateEntity.project = this.$scope.findProjectInList(toUpdateEntity.project);
			}
		}

		/**
		 * Finds the correct object instance for the given project to select it in the list
		 */
		findProjectInList(expectedProject:app.domain.model.core.Project):app.domain.model.core.Project {
			for (var index = 0; index < this.$scope.projects.length; ++index) {
				if (this.$scope.projects[index].id == expectedProject.id) {
					return this.$scope.projects[index];
				}
			}
			return expectedProject;
		}

		/**
		 * Finds the correct object instance for the given PPT to select it in the list
		 */
		findPPTInList(expectedPPT:app.domain.model.ppt.ProjectPlanningTool):app.domain.model.ppt.ProjectPlanningTool {
			for (var index = 0; index < this.$scope.projectPlanningTools.length; ++index) {
				if (this.$scope.projectPlanningTools[index].id == expectedPPT.id) {
					return this.$scope.projectPlanningTools[index];
				}
			}
			return expectedPPT;
		}

		setOperationFinishState(success: boolean, state: string) {
			var scope = this.$scope;
			var settings = this.settings;

			if (success) {
				this.$scope[state] = app.application.ApplicationState.successful;
				setTimeout(() => {
					scope[state] = null;
					scope.$apply();
				}, settings.successDelay);
			} else {
				this.$scope[state] = app.application.ApplicationState.failed;
			}
		}
	}
}