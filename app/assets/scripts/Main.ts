/// <reference path='libraries/declarations/angularJs/angular.d.ts' />
/// <reference path='classes/module/MainModule.ts' />

/// <reference path='classes/application/TaskTemplateListController.ts' />
/// <reference path='classes/application/DecisionListController.ts' />
/// <reference path='classes/application/RegisterController.ts' />
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
		$routeProvider.when('/register', {
			templateUrl: '/public/views/templates/registerView.html',
			controller: 'registerController'
		});
        $routeProvider.otherwise({
            redirectTo:'/'
        });
    });
	app.config(function ( $httpProvider) {
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
	});

	app.run(['$rootScope', '$location', 'authenticationService', function ($rootScope, $location, authenticationService) {
		// access denied for view? redirect to registration view
		$rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
			$location.path("/register");
		});
	}]);

    app.controller('taskTemplateListController', ['$scope', '$location', 'persistenceService', TaskTemplateListController]);
	app.controller('decisionListController', ['$scope', '$location', 'persistenceService', DecisionListController]);
	app.controller('mappingController', ['$scope', '$location', 'persistenceService', MappingController]);
	app.controller('transmissionController', ['$scope', '$location', 'persistenceService', '$http', TransmissionController]);
	app.controller('registerController', ['$scope', '$location', '$http', 'authenticationService', RegisterController]);

    app.service('persistenceService', ['$http', function($http) {
		return {
            taskTemplateRepository: new core.TaskTemplateRepository($http),
			decisionRepository: new dks.DecisionRepository($http),
			mappingRepository: new core.MappingRepository($http)
        };
    }]);

	app.service('authenticationService', ['$http', '$rootScope', '$q', function($http, $rootScope, $q) {
		var authenticationService: AuthenticationService = new AuthenticationService($http, $q);
		$rootScope.authenticator = authenticationService;
		return authenticationService;
	}]);

    angular.bootstrap(document, ["MainModule"]);
}