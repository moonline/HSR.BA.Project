/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/TaskProperty.ts' />

module core {
	export class TaskPropertyRepository extends core.Repository<TaskProperty> {
		constructor(httpService) {
			super(httpService);
			this.type = TaskProperty;
			this.resources = {
				'all': configuration.paths.taskProperty.list
			};
		}
	}
}