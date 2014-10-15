/// <reference path='libraries/declarations/angularJs/angular.d.ts' />
/// <reference path='classes/module/MainModule.ts' />

/// <reference path='classes/application/TaskTemplateListController.ts' />
/// <reference path='classes/application/DecisionListController.ts' />
/// <reference path='classes/application/LoginController.ts' />
/// <reference path='classes/application/MappingController.ts' />
/// <reference path='classes/application/TransmissionController.ts' />

/// <reference path='classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='classes/domain/repository/DecisionRepository.ts' />
/// <reference path='classes/domain/repository/MappingRepository.ts' />

/// <reference path='classes/service/AuthenticationService.ts' />


module core {
    'use strict';

    var app = angular.module('MainModule', ['ngRoute']);

    app.config(function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: '/public/views/templates/taskTemplateListView.html',
            controller: 'taskTemplateListController',
			resolve: {
				auth: ["$q", "authenticationService", function($q, authenticationService) {
					// check if user is still logged in (promise still resolved), otherwise wait for resolve
					if(authenticationService.isLoggedIn) { return true; }
					return authenticationService.readyPromise.then(function(user) {});
				}]
			}
        });
		$routeProvider.when('/decisions', {
			templateUrl: '/public/views/templates/decisionListView.html',
			controller: 'decisionListController',
			resolve: {
				auth: ["$q", "authenticationService", function($q, authenticationService) {
					if(authenticationService.isLoggedIn) { return true; }
					return authenticationService.readyPromise.then(function(user) {});
				}]
			}
		});
		$routeProvider.when('/mappings', {
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
		$routeProvider.when('/user', {
			templateUrl: '/public/views/templates/loginView.html',
			controller: 'loginController'
		});
        $routeProvider.otherwise({
            redirectTo:'/'
        });
    });
	app.config(function ( $httpProvider) {
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
	});

	app.run(['$rootScope', '$location', 'authenticationService', function ($rootScope, $location, authenticationService) {
		$rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
			$location.path("/user");
		});
	}]);

    app.controller('taskTemplateListController', ['$scope', '$location', 'persistenceService', TaskTemplateListController]);
	app.controller('decisionListController', ['$scope', '$location', 'persistenceService', DecisionListController]);
	app.controller('mappingController', ['$scope', '$location', 'persistenceService', MappingController]);
	app.controller('transmissionController', ['$scope', '$location', 'persistenceService', '$http', TransmissionController]);
	app.controller('loginController', ['$scope', '$location', '$http', 'authenticationService', LoginController]);

    app.service('persistenceService', ['$http', function($http) {
		return {
            taskTemplateRepository: new core.TaskTemplateRepository($http),
			decisionRepository: new dks.DecisionRepository($http),
			mappingRepository: new core.MappingRepository($http)
        };
    }]);

	app.service('authenticationService', ['$http', '$rootScope', '$q', AuthenticationService]);

    angular.bootstrap(document, ["MainModule"]);
}