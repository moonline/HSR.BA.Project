/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/TaskTemplate.ts' />

module core {
    export class TaskTemplateRepository extends core.Repository<TaskTemplate> {
		constructor(httpService) {
			super(httpService);
			this.type = TaskTemplate;
			this.resources = {
				'all': 'data/eeppi/tasktemplate/list.json'
			};
		}
    }
}