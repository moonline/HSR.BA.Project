/// <reference path='../../../configuration/paths.ts' />

/// <reference path='../../domain/repository/Repository.ts' />
/// <reference path='../../domain/model/Project.ts' />

module app.domain.repository.core {
	export class ProjectRepository extends app.domain.repository.core.Repository<app.domain.model.core.Project> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.core.Project;
			this.resources = configuration.paths.project;
		}
	}
}