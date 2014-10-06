/// <reference path='../../classes/domain/model/TaskTemplate.ts' />

module core {
    'use strict';

    export class TaskTemplateListController {

        /**
         * @inject
         */
        public static $inject: string[] = [
            '$scope',
            '$location'
        ];

        constructor($scope, $location, persistenceService) {
            persistenceService['taskTemplateRepository'].findAll(function(taskTemplates) {
                $scope.taskTemplates = taskTemplates;
            });
        }
    }
}