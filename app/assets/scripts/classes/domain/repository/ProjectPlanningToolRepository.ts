/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../../domain/model/RequestTemplate.ts' />
/// <reference path='../../domain/model/PPTAccount.ts' />
/// <reference path='../../domain/model/Project.ts' />

module app.domain.repository.ppt {
	export class ProjectPlanningToolRepository extends app.domain.repository.core.Repository<app.domain.model.ppt.ProjectPlanningTool> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.ppt.ProjectPlanningTool;
			this.resources = configuration.paths.projectPlanningTool;
		}

		public transmitTasks(exportRequest: any, targetPPTAccount: app.domain.model.ppt.PPTAccount, pptRequestPath: string, project: app.domain.model.core.Project,
				callback: (success: boolean, item: any) => void) {
			var method: string = this.resources['transmit']['method'].toLowerCase();
			var url: string = this.getResourcePath('transmit');
			var type = this.type;

			this.httpService[method](url, {
					account: targetPPTAccount,
					path: pptRequestPath,
					content: exportRequest.requestBody,
					taskTemplate: exportRequest.taskTemplate,
					// TODO: remove this if API is fixed
					"taskProperties[]":"53-Example Value",
					project: project
				}
			).success(function(data, status, headers, config){
				callback(true, data);
			}).error(function(data, status, headers, config) {
				callback(false, data);
			});
		}
	}
}