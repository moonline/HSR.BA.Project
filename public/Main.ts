/// <reference path='resources/libraries/angularJs/angular.d.ts' />
/// <reference path='classes/module/MainModule.ts' />

/// <reference path='classes/application/TaskTemplateListController.ts' />
/// <reference path='classes/application/DecisionListController.ts' />
/// <reference path='classes/application/MappingController.ts' />
/// <reference path='classes/application/TransmissionController.ts' />

/// <reference path='classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='classes/domain/repository/DecisionRepository.ts' />
/// <reference path='classes/domain/repository/MappingRepository.ts' />


module core {
    'use strict';

    var app = angular.module('MainModule', ['ngRoute']);

    app.config(function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: '/public/resources/views/templates/taskTemplateListView.html',
            controller: 'taskTemplateListController'
        });
		$routeProvider.when('/decisions', {
			templateUrl: '/public/resources/views/templates/decisionListView.html',
			controller: 'decisionListController'
		});
		$routeProvider.when('/mappings', {
			templateUrl: '/public/resources/views/templates/mappingView.html',
			controller: 'mappingController'
		});
		$routeProvider.when('/transmission', {
			templateUrl: '/public/resources/views/templates/transmissionView.html',
			controller: 'transmissionController'
		});
        $routeProvider.otherwise({
            redirectTo:'/'
        });
    });

	app.config(function ( $httpProvider) {
		delete $httpProvider.defaults.headers.common['X-Requested-With'];
	});

    app.controller('taskTemplateListController', ['$scope', '$location', 'persistenceService', TaskTemplateListController]);
	app.controller('decisionListController', ['$scope', '$location', 'persistenceService', DecisionListController]);
	app.controller('mappingController', ['$scope', '$location', 'persistenceService', MappingController]);
	app.controller('transmissionController', ['$scope', '$location', 'persistenceService', '$http', TransmissionController]);

    app.service('persistenceService', ['$http', function($http) {
		return {
            taskTemplateRepository: new core.TaskTemplateRepository($http),
			decisionRepository: new dks.DecisionRepository($http),
			mappingRepository: new core.MappingRepository($http)
        };
    }]);

    angular.bootstrap(document, ["MainModule"]);
}