/// <reference path='classes/application/TaskTemplateListController.ts' />
/// <reference path='classes/application/DecisionListController.ts' />
/// <reference path='classes/application/LoginController.ts' />
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
		$routeProvider.when('/user', {
			templateUrl: 'resources/views/templates/loginView.html',
			controller: 'loginController'
		});
        $routeProvider.otherwise({
            redirectTo:'/'
        });
    });

    app.controller('taskTemplateListController', ['$scope', '$location', 'persistenceService', TaskTemplateListController]);
	app.controller('decisionListController', ['$scope', '$location', 'persistenceService', DecisionListController]);
	app.controller('loginController', ['$scope', '$location', '$http', 'persistenceService', 'userManagementService', LoginController]);

    app.service('persistenceService', ['$http', function($http) {
        return {
            taskTemplateRepository: new core.TaskTemplateRepository($http),
			decisionRepository: new dks.DecisionRepository($http)
        };
    }]);

	app.service('userManagementService', ['$http', function($http) {
		var userManagementService: any = {
			loggedInUser: null
		};

		return userManagementService;
	}]);

    angular.bootstrap(document, ["MainModule"]);
}