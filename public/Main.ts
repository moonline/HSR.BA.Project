/// <reference path='classes/application/TaskTemplateListController.ts' />
/// <reference path='classes/module/MainModule.ts' />
/// <reference path='resources/libraries/angularJs/angular.d.ts' />
/// <reference path='classes/domain/repository/TaskTemplateRepository.ts' />

/**
 * @type {angular.Module}
 */
module core {
    'use strict';

    var app = angular.module('MainModule', ['ngRoute']);

    app.config(function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'resources/views/templates/taskTemplateListView.html',
            controller: 'taskTemplateListController'
        });
        $routeProvider.otherwise({
            redirectTo:'/'
        });
    });

    app.controller('taskTemplateListController', ['$scope', '$location', 'persistenceService', TaskTemplateListController]);

    app.service('persistenceService', ['$http', function($http) {
        return {
            taskTemplateRepository: new TaskTemplateRepository($http)
        };
    }]);

    angular.bootstrap(document, ["MainModule"]);
}