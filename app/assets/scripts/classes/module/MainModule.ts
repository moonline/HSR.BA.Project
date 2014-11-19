/// <reference path='../../classes/application/RegisterController.ts' />
/// <reference path='../../classes/application/MappingController.ts' />
/// <reference path='../../classes/application/TransmissionController.ts' />
/// <reference path='../../classes/application/AdminController.ts' />
/// <reference path='../../classes/application/DashboardController.ts' />

/// <reference path='../../classes/domain/model/User.ts' />

/// <reference path='../../classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='../../classes/domain/repository/TaskPropertyRepository.ts' />
/// <reference path='../../classes/domain/repository/DecisionRepository.ts' />
/// <reference path='../../classes/domain/repository/MappingRepository.ts' />
/// <reference path='../../classes/domain/repository/DecisionKnowledgeSystemRepository.ts' />
/// <reference path='../../classes/domain/repository/ProblemRepository.ts' />
/// <reference path='../../classes/domain/repository/PPTAccountRepository.ts' />
/// <reference path='../../classes/domain/repository/RequestTemplateRepository.ts' />
/// <reference path='../../classes/domain/repository/ProjectRepository.ts' />
/// <reference path='../../classes/domain/repository/ProcessorRepository.ts' />
/// <reference path='../../classes/domain/repository/ProjectPlanningToolRepository.ts' />
/// <reference path='../../classes/domain/repository/AlternativeRepository.ts' />
/// <reference path='../../classes/domain/repository/OptionRepository.ts' />

/// <reference path='../../classes/service/AuthenticationService.ts' />

module app.mod {
    'use strict';

    export class MainModule {
		private module;

        constructor(angular: any, name: string) {
			this.module = angular.module(name, ['ngRoute']);

			this.configureModule();
			this.addControllers();
			this.addServices();

			this.module.run(['$rootScope', '$location', 'authenticationService', function ($rootScope, $location, authenticationService) {
				// access denied for view? redirect to registration view
				$rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
					$location.path("/register");
				});

				// TODO: bind current view
				$rootScope.currentView = '';

				// make Status available in view
				$rootScope.Status = app.application.Status;

				$rootScope.loginStatus = null;
				$rootScope.login = function(username: string, password: string) {
					authenticationService.login(username, password, function(success: boolean, user: app.domain.model.core.User) {
						if(success) {
							$rootScope.loginStatus = app.application.Status.success;
						} else {
							$rootScope.loginStatus = app.application.Status.error;
						}
					});
				};
				$rootScope.logout = function() {
					authenticationService.logout();
					$rootScope.loginStatus = null;
					$location.path("/");
				}
			}]);
		}

		private configureModule() {
			this.module.config(function($routeProvider) {
				$routeProvider.when('/', {
					templateUrl: '/public/views/templates/dashboardView.html',
					controller: 'dashboardController'
				});
				$routeProvider.when('/mapping', {
					templateUrl: '/public/views/templates/mappingView.html',
					controller: 'mappingController',
					resolve: {
						auth: ["$q", "authenticationService", function($q, authenticationService) {
							if(authenticationService.isLoggedIn) { return true; }
							return authenticationService.readyPromise.then(function(user) {});
						}]
					}
				});
				$routeProvider.when('/transmission', {
					templateUrl: '/public/views/templates/transmissionView.html',
					controller: 'transmissionController',
					resolve: {
						auth: ["$q", "authenticationService", function($q, authenticationService) {
							if(authenticationService.isLoggedIn) { return true; }
							return authenticationService.readyPromise.then(function(user) {});
						}]
					}
				});
				$routeProvider.when('/admin', {
					templateUrl: '/public/views/templates/adminView.html',
					controller: 'adminController',
					resolve: {
						auth: ["$q", "authenticationService", function($q, authenticationService) {
							if(authenticationService.isLoggedIn) { return true; }
							return authenticationService.readyPromise.then(function(user) {});
						}]
					}
				});
				$routeProvider.when('/register', {
					templateUrl: '/public/views/templates/registerView.html',
					controller: 'registerController'
				});
				$routeProvider.otherwise({
					redirectTo:'/'
				});
			});
		}

		private addControllers() {
			this.module.controller('mappingController', ['$scope', '$location', '$http', 'persistenceService', app.application.MappingController]);
			this.module.controller('transmissionController', ['$scope', '$location', 'persistenceService', 'authenticationService', '$http', app.application.TransmissionController]);
			this.module.controller('registerController', ['$scope', '$location', '$http', 'persistenceService', 'authenticationService', app.application.RegisterController]);
			this.module.controller('adminController', ['$scope', '$location', '$http', 'persistenceService', 'authenticationService', app.application.AdminController]);
			this.module.controller('dashboardController', ['$scope', '$location', '$http', 'persistenceService', app.application.DashboardController]);

		}

		private addServices() {
			this.module.service('persistenceService', ['$http', function($http) {
				var repositories:{
					taskTemplateRepository: app.domain.repository.core.TaskTemplateRepository;
					taskPropertyRepository: app.domain.repository.core.TaskPropertyRepository;
					mappingRepository:  app.domain.repository.core.MappingRepository;
					processorRepository: app.domain.repository.core.ProcessorRepository;
					projectRepository: app.domain.repository.core.ProjectRepository;

					decisionKnowledgeRepository: app.domain.repository.dks.DecisionKnowledgeSystemRepository;
					problemRepository: app.domain.repository.dks.ProblemRepository;
					alternativeRepository: app.domain.repository.dks.AlternativeRepository;
					decisionRepository: app.domain.repository.dks.DecisionRepository;
					optionRepository: app.domain.repository.dks.OptionRepository;

					pptAccountRepository: app.domain.repository.ppt.PPTAccountRepository;
					requestTemplateRepository: app.domain.repository.ppt.RequestTemplateRepository;
					projectPlanningToolRepository: app.domain.repository.ppt.ProjectPlanningToolRepository;
				} = <any>{};
				repositories.taskTemplateRepository = new app.domain.repository.core.TaskTemplateRepository($http);
				repositories.taskPropertyRepository = new app.domain.repository.core.TaskPropertyRepository($http);
				repositories.mappingRepository = new app.domain.repository.core.MappingRepository($http);
				repositories.processorRepository = new app.domain.repository.core.ProcessorRepository($http);
				repositories.projectRepository = new app.domain.repository.core.ProjectRepository($http);

				repositories.decisionKnowledgeRepository = new app.domain.repository.dks.DecisionKnowledgeSystemRepository($http);
				repositories.problemRepository = new app.domain.repository.dks.ProblemRepository($http, repositories);
				repositories.alternativeRepository = new app.domain.repository.dks.AlternativeRepository($http);
				repositories.decisionRepository = new app.domain.repository.dks.DecisionRepository($http);
				repositories.optionRepository = new app.domain.repository.dks.OptionRepository($http);

				repositories.pptAccountRepository = new app.domain.repository.ppt.PPTAccountRepository($http);
				repositories.requestTemplateRepository = new app.domain.repository.ppt.RequestTemplateRepository($http);
				repositories.projectPlanningToolRepository = new app.domain.repository.ppt.ProjectPlanningToolRepository($http);

				return repositories;
			}]);

			this.module.service('authenticationService', ['$http', '$rootScope', '$q', function($http, $rootScope, $q) {
				var authenticationService: app.service.AuthenticationService = new app.service.AuthenticationService($http, $q);
				$rootScope.authenticator = authenticationService;
				return authenticationService;
			}]);
		}

		get app() {
			return this.module;
		}

		get name() {
			return this.module.name;
		}
    }
}

