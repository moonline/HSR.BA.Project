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
			$scope.addRequestTemplate = function(ppt: app.domain.model.ppt.ProjectPlanningTool, url: string, requestBody: string) {
				var newRequestTemplate = new app.domain.model.ppt.RequestTemplate(ppt, url, requestBody);
				newRequestTemplate.project = $scope.currentProject;
				(<any>newRequestTemplate).requestTemplate = newRequestTemplate.requestBody;

				$scope.operationState = app.application.ApplicationState.saving;
				requestTemplateRepository.add(newRequestTemplate, function(success: boolean, item: app.domain.model.ppt.RequestTemplate){
					$scope.setOperationFinishState(success);
				})
			};

			$scope.updateRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
				(<any>requestTemplate).requestTemplate = requestTemplate.requestBody;

				$scope.operationState = app.application.ApplicationState.saving;
				requestTemplateRepository.update(requestTemplate, function(success: boolean, item: app.domain.model.ppt.RequestTemplate){
					$scope.setOperationFinishState(success);
				})
			};

			$scope.removeRequestTemplate = function(requestTemplate: app.domain.model.ppt.RequestTemplate) {
				$scope.operationState = app.application.ApplicationState.saving;
				requestTemplateRepository.remove(requestTemplate, function(success: boolean){
					$scope.setOperationFinishState(success);
				})
			};


			/* task properties */
			$scope.createTaskProperty = function(newTaskPropertyName: string) {
				$scope.operationState = app.application.ApplicationState.saving;
				taskPropertyRepository.add(new app.domain.model.core.TaskProperty(newTaskPropertyName), function(success, property) {
					$scope.setOperationFinishState(success);
				});
			};

			$scope.renameTaskProperty = function(property: app.domain.model.core.TaskProperty, newName: string) {
				if(property && newName) {
					property.name = newName;
					$scope.operationState = app.application.ApplicationState.saving;
					taskPropertyRepository.update(property, function(success, property) {
						$scope.setOperationFinishState(success);
					});
				}
			};


			/* decision knowledge systems */
			$scope.updateDKS = function(dks: app.domain.model.dks.DecisionKnowledgeSystem) {
				$scope.operationState = app.application.ApplicationState.saving;
				decisionKnowledgeSystemRepository.update(dks, function(success: boolean, item: app.domain.model.dks.DecisionKnowledgeSystem){
					$scope.setOperationFinishState(success);
				})
			};


			/* processors */
			$scope.createProcessor = function(newProcessorName: string, newProcessorProject: app.domain.model.core.Project, newProcessorCode: string) {
				var processor: app.domain.model.core.Processor = new app.domain.model.core.Processor (newProcessorName, newProcessorProject, newProcessorCode);
				$scope.operationState = app.application.ApplicationState.saving;
				processorRepository.add(processor, function(success: boolean, item: app.domain.model.core.Processor) {
					$scope.setOperationFinishState(success);
				});
                return processor;
			};

			$scope.updateProcessor = function(processor: app.domain.model.core.Processor, newProcessorName: string, newProcessorProject: app.domain.model.core.Project, newProcessorCode: string) {
				$scope.operationState = app.application.ApplicationState.saving;
                processor.name = newProcessorName;
                processor.project = newProcessorProject;
                processor.code = newProcessorCode;
                processorRepository.update(processor, function(success: boolean, item: app.domain.model.core.Processor) {
					$scope.setOperationFinishState(success);
				});
			};

			$scope.removeProcessor = function(processor: app.domain.model.core.Processor) {
				$scope.operationState = app.application.ApplicationState.saving;
                processorRepository.remove(processor, function(success: boolean){
					$scope.setOperationFinishState(success);
				});
			};

            $scope.showSelectedProcessor = function() {
                var toUpdateProcessor = $scope["toUpdateProcessor"];
                $scope.processorNewName = toUpdateProcessor.name;
                $scope.processorNewProject = $scope.findProjectInList(toUpdateProcessor.project);
                $scope.processorNewCode = toUpdateProcessor.code;
            };

            //Finds the correct object instance for the given project to select it in the list
            $scope.findProjectInList = function(expectedProject: app.domain.model.core.Project) {
                for(var index=0;index<$scope.projects.length;++index) {
                    if($scope.projects[index].id==expectedProject["id"]) {
                        return $scope.projects[index];
                    }
                }
                return null;
			};

			$scope.updateWithCorrectPPT = function (toUpdatePPTEntity) {
				toUpdatePPTEntity.ppt = $scope.findPPTInList(toUpdatePPTEntity.ppt);
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

			$scope.setOperationFinishState = function(success: boolean) {
				if(success) {
					setTimeout(() => {
						$scope.operationState = app.application.ApplicationState.successful; $scope.$apply();
					}, configuration.settings.messageBoxDelay);
				} else {
					setTimeout(() => {
						$scope.operationState = app.application.ApplicationState.failed; $scope.$apply();
					}, configuration.settings.messageBoxDelay);
				}
			};
		}
	}
}