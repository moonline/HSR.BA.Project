/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/repository/TaskTemplateRepository.ts' />

module core {
    'use strict';

    export class TaskTemplateListController {
		taskTemplateRepository: TaskTemplateRepository;
		$scope: any;

        /**
         * @inject
         */
        public static $inject: string[] = [
            '$scope',
            '$location'
        ];

        constructor($scope, $location, persistenceService) {
			this.$scope = $scope;
			this.taskTemplateRepository = persistenceService['taskTemplateRepository'];
            this.taskTemplateRepository.findAll(function(taskTemplates) {
                $scope.taskTemplates = taskTemplates;
            });
		}
    }
}