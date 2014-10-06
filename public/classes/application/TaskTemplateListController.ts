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

        constructor($scope, $location) {
            var taskProperties = [
                new TaskProperty("type"), new TaskProperty("assignee"), new TaskProperty("Description")
            ];

            var taskTemplates = [
                new TaskTemplate("Define criterions", [taskProperties[0], taskProperties[2]]),
                new TaskTemplate("Rank criterions", [taskProperties[2]]),
                new TaskTemplate("Find crition values", [taskProperties[0], taskProperties[1]])
            ];

            $scope.taskTemplates = taskTemplates;
        }
    }
}