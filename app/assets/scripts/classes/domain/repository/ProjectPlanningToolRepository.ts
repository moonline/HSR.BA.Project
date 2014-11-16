/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/ProjectPlanningTool.ts' />

module app.domain.repository.ppt {
	export class ProjectPlanningToolRepository extends app.domain.repository.core.Repository<app.domain.model.ppt.ProjectPlanningTool> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.ppt.ProjectPlanningTool;
			this.resources = configuration.paths.projectPlanningTool;
		}
	}
}