/// <reference path='../../domain/repository/PersistentEntity.ts' />

/// <reference path='../../domain/model/ProjectPlanningTool.ts' />

module app.domain.model.core {
	export class RequestTemplate {
		name: string;
		ppt: app.domain.model.ppt.ProjectPlanningTool;
		requestBody: string;
		public id: number;

		constructor(name: string, ppt: app.domain.model.ppt.ProjectPlanningTool, requestBody: string = null) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
			this.ppt = ppt;
			this.requestBody = requestBody;
		}
	}
}