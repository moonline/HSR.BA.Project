/// <reference path='../../../classes/domain/model/TaskTemplate.ts' />

module core {
    export class TaskTemplateRepository {
        private httpService;

        constructor(httpService) {
            this.httpService = httpService;
        }

        public findAll(callback) {
            var data = this.httpService.get('data/tasktemplate/list').success(function(data){
                var taskTemplates: TaskTemplate[] = [];
                data.taskTemplates.forEach(function(element){
                    taskTemplates.push(TaskTemplate.createFromJson(element));
                });
                callback(taskTemplates);
            });
        }
    }
}