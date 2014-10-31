/// <reference path='libraries/declarations/angularJs/angular.d.ts' />
/// <reference path='classes/module/MainModule.ts' />

/// <reference path='classes/application/RegisterController.ts' />
/// <reference path='classes/application/MappingController.ts' />
/// <reference path='classes/application/TransmissionController.ts' />

/// <reference path='classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='classes/domain/repository/TaskPropertyRepository.ts' />
/// <reference path='classes/domain/repository/DecisionRepository.ts' />
/// <reference path='classes/domain/repository/MappingRepository.ts' />
/// <reference path='classes/domain/repository/DecisionKnowledgeSystemRepository.ts' />
/// <reference path='classes/domain/repository/ProblemRepository.ts' />

/// <reference path='classes/service/AuthenticationService.ts' />


module app {
    'use strict';

    var application = angular.module('MainModule', ['ngRoute']);

	application.config(function($routeProvider) {
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
		$routeProvider.when('/register', {
			templateUrl: '/public/views/templates/registerView.html',
			controller: 'registerController'
		});
        $routeProvider.otherwise({
            redirectTo:'/'
        });
    });
	application.config(function ( $httpProvider) {
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
	});

	application.run(['$rootScope', '$location', 'authenticationService', function ($rootScope, $location, authenticationService) {
		// access denied for view? redirect to registration view
		$rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
			$location.path("/register");
		});
	}]);

	application.controller('mappingController', ['$scope', '$location', '$http', 'persistenceService', app.application.MappingController]);
	application.controller('transmissionController', ['$scope', '$location', 'persistenceService', '$http', app.application.TransmissionController]);
	application.controller('registerController', ['$scope', '$location', '$http', 'authenticationService', app.application.RegisterController]);

	application.service('persistenceService', ['$http', function($http) {
		return {
            taskTemplateRepository: new app.domain.repository.core.TaskTemplateRepository($http),
			taskPropertyRepository: new app.domain.repository.core.TaskPropertyRepository($http),
			decisionRepository: new app.domain.repository.dks.DecisionRepository($http),
			mappingRepository: new app.domain.repository.core.MappingRepository($http),
			decisionKnowledgeRepository: new app.domain.repository.dks.DecisionKnowledgeSystemRepository($http),
			problemRepository: new app.domain.repository.dks.ProblemRepository($http)
        };
    }]);

	application.service('authenticationService', ['$http', '$rootScope', '$q', function($http, $rootScope, $q) {
		var authenticationService: app.service.AuthenticationService = new app.service.AuthenticationService($http, $q);
		$rootScope.authenticator = authenticationService;
		return authenticationService;
	}]);

    angular.bootstrap(document, ["MainModule"]);
}