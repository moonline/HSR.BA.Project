/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/TaskTemplate.ts' />

module app.domain.repository.core {
    export class TaskTemplateRepository extends app.domain.repository.core.Repository<app.domain.model.core.TaskTemplate> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.core.TaskTemplate;
			this.resources = {
				'all': configuration.paths.taskTemplate.list,
				'one': configuration.paths.taskTemplate.detail,
				'create': configuration.paths.taskTemplate.create
			};
		}
    }
}