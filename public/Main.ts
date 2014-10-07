/// <reference path='classes/application/TaskTemplateListController.ts' />
/// <reference path='classes/application/DecisionListController.ts' />
/// <reference path='classes/module/MainModule.ts' />
/// <reference path='resources/libraries/angularJs/angular.d.ts' />
/// <reference path='classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='classes/domain/repository/DecisionRepository.ts' />


module core {
    'use strict';

    var app = angular.module('MainModule', ['ngRoute']);

    app.config(function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'resources/views/templates/taskTemplateListView.html',
            controller: 'taskTemplateListController'
        });
		$routeProvider.when('/decisions', {
			templateUrl: 'resources/views/templates/decisionListView.html',
			controller: 'decisionListController'
		});
        $routeProvider.otherwise({
            redirectTo:'/'
        });
    });

    app.controller('taskTemplateListController', ['$scope', '$location', 'persistenceService', TaskTemplateListController]);
	app.controller('decisionListController', ['$scope', '$location', 'persistenceService', DecisionListController]);

    app.service('persistenceService', ['$http', function($http) {
        return {
            taskTemplateRepository: new core.TaskTemplateRepository($http),
			decisionRepository: new dks.DecisionRepository($http)
        };
    }]);

    angular.bootstrap(document, ["MainModule"]);
}