/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/TaskProperty.ts' />

module app.domain.repository.core {
	export class TaskPropertyRepository extends app.domain.repository.core.Repository<app.domain.model.core.TaskProperty> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.core.TaskProperty;
			this.resources = configuration.paths.taskProperty;
		}
	}
}