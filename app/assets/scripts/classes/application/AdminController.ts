/// <reference path='../../configuration/application.ts' />

/// <reference path='../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../domain/model/RequestTemplate.ts' />
/// <reference path='../domain/model/Project.ts' />
/// <reference path='../domain/model/Processor.ts' />

/// <reference path='../domain/repository/TaskPropertyRepository.ts' />

/// <reference path='../application/ApplicationState.ts' />


module app.application {
	'use strict';

	export class AdminController {
		$scope: any;
		authenticationService: app.service.AuthenticationService;

		constructor($scope, $location, $http, persistenceService, authenticationService) {
			this.authenticationService = authenticationService;
			$scope.ApplicationState = app.application.ApplicationState;
			$scope.operationState = app.application.ApplicationState.waiting;

			var taskPropertyRepository = persistenceService['taskPropertyRepository'];
			var requestTemplateRepository = persistenceService['requestTemplateRepository'];
			var projectRepository = persistenceService['projectRepository'];
            var processorRepository = persistenceService['processorRepository'];
			var projectPlanningToolRepository = persistenceService['projectPlanningToolRepository'];
			var decisionKnowledgeSystemRepository = persistenceService['decisionKnowledgeSystemRepository'];

			$scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 4 seconds
				if($scope.operationState == app.application.ApplicationState.pending) {
					$scope.operationState = app.application.ApplicationState.failed;
					$scope.$apply();
				}
			}, 4000);
			taskPropertyRepository.findAll(function(success, taskProperties) {
				$scope.taskProperties = taskProperties;

				// prevent request mix of angular -> call sync instead of parallel async
				requestTemplateRepository.findAll(function(success, requestTemplates){
					$scope.requestTemplates = requestTemplates;

					// TODO: projects redundance?
					projectRepository.findAll(function(success, projects){
						$scope.currentProject = projects[0];

						processorRepository.findAll(function(success, processors){
							$scope.processors = processors;

							projectRepository.findAll(function(success, projects){
								$scope.projects = projects;

								projectPlanningToolRepository.findAll(function(success, ppts){
									$scope.projectPlanningTools = ppts;

									decisionKnowledgeSystemRepository.findAll(function(success, dkss){
										$scope.dkss = dkss;

										setTimeout(() => { $scope.operationState = app.application.ApplicationState.successful; $scope.$apply(); }, configuration.settings.messageBoxDelay);
									});
								});
							});
						});
					});
				});
			});

			/*configuration.projectPlanningTools.forEach(function(pptConfig: any) {
				projectPlanningTools.push(new app.domain.model.ppt.ProjectPlanningTool(pptConfig.url, pptConfig.account, pptConfig.password))
			});*/

			//$scope.requestTemplates.push(new app.domain.model.ppt.RequestTemplate("Example", null, '{\n\t"fields": {\n\t\t"project": {\n\t\t\t"key": "TEST"\n\t\t},\n\t\t"assignee": "${assignee}",\n\t\t"description": "${description}",\n\t\t"issuetype": {\n\t\t\t"name": "${type}"\n\t\t}\n\t}\n}'));


			/* request templates */
			$scope.addRequestTemplate = function(name: string, url: string, project: app.domain.model.core.Project, ppt: app.domain.model.ppt.ProjectPlanningTool, requestBodyTemplate: string) {
				var newRequestTemplate = new app.domain.model.ppt.RequestTemplate(name, url, ppt, project, requestBodyTemplate);
				newRequestTemplate.project = $scope.currentProject;

				$scope.manageRequestTemplatesStatus = app.application.ApplicationState.saving;
				requestTemplateRepository.add(newRequestTemplate, function(success: boolean, item: app.domain.model.ppt.RequestTemplate){
					$scope.setOperationFinishState(success, 'manageRequestTemplatesStatus');
				})
			};

			$scope.updateRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
				if($scope.hasToUpdateRequestTemplateChanged) {
					$scope.hasToUpdateRequestTemplateChanged = false;

					$scope.manageRequestTemplatesStatus = app.application.ApplicationState.saving;
					requestTemplateRepository.update(requestTemplate, function(success: boolean, item: app.domain.model.ppt.RequestTemplate){
						$scope.setOperationFinishState(success, 'manageRequestTemplatesStatus');
					})
				}
			};

			$scope.removeRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
				$scope.manageRequestTemplatesStatus = app.application.ApplicationState.saving;
				requestTemplateRepository.remove(requestTemplate, function(success: boolean){
					$scope.setOperationFinishState(success, 'manageRequestTemplatesStatus');
				})
			};

			$scope.hasToUpdateRequestTemplateChanged = false;

			$scope.toUpdateRequestTemplateChanged = function() {
				$scope.hasToUpdateRequestTemplateChanged = true;
			};


			/* task properties */
			$scope.createTaskProperty = function(newTaskPropertyName: string) {
				$scope.managePropertiesStatus = app.application.ApplicationState.saving;
				taskPropertyRepository.add(new app.domain.model.core.TaskProperty(newTaskPropertyName), function(success, property) {
					$scope.setOperationFinishState(success, 'managePropertiesStatus');
				});
			};

			$scope.renameTaskProperty = function(property: app.domain.model.core.TaskProperty) {
				if($scope.hasToUpdatePropertyChanged) {
					$scope.hasToUpdatePropertyChanged = false;
					$scope.managePropertiesStatus = app.application.ApplicationState.saving;
					taskPropertyRepository.update(property, function (success, property) {
						$scope.setOperationFinishState(success, 'managePropertiesStatus');
					});
				}
			};

			$scope.hasToUpdatePropertyChanged = false;

			$scope.toUpdatePropertyChanged = function() {
				$scope.hasToUpdatePropertyChanged = true;
			};


			/* decision knowledge systems */
			$scope.updateDKS = function(dks: app.domain.model.dks.DecisionKnowledgeSystem) {
				if($scope.hasToUpdateDKSChanged) {
					$scope.hasToUpdateDKSChanged = false;
					$scope.manageDKSStatus = app.application.ApplicationState.saving;
					decisionKnowledgeSystemRepository.update(dks, function (success:boolean, item:app.domain.model.dks.DecisionKnowledgeSystem) {
						$scope.setOperationFinishState(success, 'manageDKSStatus');
					})
				}
			};

			$scope.hasToUpdateDKSChanged = false;

			$scope.toUpdateDKSChanged = function() {
				$scope.hasToUpdateDKSChanged = true;
			};


			/* processors */
			$scope.createProcessor = function(newProcessorName: string, newProcessorProject: app.domain.model.core.Project, newProcessorCode: string) {
				var processor: app.domain.model.core.Processor = new app.domain.model.core.Processor (newProcessorName, newProcessorProject, newProcessorCode);
				$scope.manageProcessorsStatus = app.application.ApplicationState.saving;
				processorRepository.add(processor, function(success: boolean, item: app.domain.model.core.Processor) {
					$scope.setOperationFinishState(success, 'manageProcessorsStatus');
				});
                return processor;
			};

			$scope.updateProcessor = function(processor: app.domain.model.core.Processor) {
				if($scope.hasToUpdateProcessorChanged) {
					$scope.hasToUpdateProcessorChanged = false;
					$scope.manageProcessorsStatus = app.application.ApplicationState.saving;
					processorRepository.update(processor, function (success:boolean, item:app.domain.model.core.Processor) {
						$scope.setOperationFinishState(success, 'manageProcessorsStatus');
					});
				}
			};

			$scope.removeProcessor = function(processor: app.domain.model.core.Processor) {
				$scope.manageProcessorsStatus = app.application.ApplicationState.saving;
                processorRepository.remove(processor, function(success: boolean){
					$scope.setOperationFinishState(success, 'manageProcessorsStatus');
				});
			};

			$scope.hasToUpdateProcessorChanged = false;

			$scope.toUpdateProcessorChanged = function() {
				$scope.hasToUpdateProcessorChanged = true;
			};

			$scope.updateWithCorrectProjectAndPPT = function (toUpdateEntity) {
				if(toUpdateEntity.hasOwnProperty('ppt')) {
					toUpdateEntity.ppt = $scope.findPPTInList(toUpdateEntity.ppt);
				}
				if(toUpdateEntity.hasOwnProperty('project')) {
					toUpdateEntity.project = $scope.findProjectInList(toUpdateEntity.project);
				}
			};

            //Finds the correct object instance for the given project to select it in the list
			$scope.findProjectInList = function (expectedProject:app.domain.model.core.Project) {
				for (var index = 0; index < $scope.projects.length; ++index) {
					if ($scope.projects[index].id == expectedProject.id) {
						return $scope.projects[index];
					}
				}
				return expectedProject;
			};

			//Finds the correct object instance for the given PPT to select it in the list
			$scope.findPPTInList = function (expectedPPT:app.domain.model.ppt.ProjectPlanningTool) {
				for (var index = 0; index < $scope.projectPlanningTools.length; ++index) {
					if ($scope.projectPlanningTools[index].id == expectedPPT.id) {
						return $scope.projectPlanningTools[index];
					}
				}
				return expectedPPT;
			};

			$scope.setOperationFinishState = function(success: boolean, state: string) {
				if(success) {
					$scope[state] = app.application.ApplicationState.successful;
					setTimeout(() => { $scope[state] = null; $scope.$apply(); }, configuration.settings.successDelay);
				} else {
					$scope[state] = app.application.ApplicationState.failed;
				}
			};
		}
	}
}