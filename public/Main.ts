/// <reference path='classes/application/TaskTemplateListController.ts' />
/// <reference path='classes/module/MainModule.ts' />
/// <reference path='resources/libraries/angularJs/angular.d.ts' />

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

    app.controller('taskTemplateListController', TaskTemplateListController);

    angular.bootstrap(document, ["MainModule"]);
}