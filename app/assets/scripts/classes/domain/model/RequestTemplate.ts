/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='../../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../../domain/model/Project.ts' />

module app.domain.model.ppt {
	export class RequestTemplate implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "ppt", type: app.domain.model.ppt.ProjectPlanningTool, subType: null },
				{ name: "url", type: String, subType: null },
				{ name: "requestTemplate", type: String, subType: null }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null },
				{ name: "project", type: app.domain.model.core.Project, subType: null }
			]
		};

		public id: number;
		ppt: app.domain.model.ppt.ProjectPlanningTool;
		url: string;
		project: app.domain.model.core.Project;
		requestBody: string;

		constructor(ppt: app.domain.model.ppt.ProjectPlanningTool, url: string, requestBody: string = null) {
			this.id = Math.round(Math.random()*1000000);
			this.ppt = ppt;
			this.url = url;
			this.requestBody = requestBody;
		}
	}
}