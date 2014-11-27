/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='../../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../../domain/model/Project.ts' />

module app.domain.model.ppt {
	'use strict';

	export class RequestTemplate implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "name", type: String, subType: null },
				{ name: "url", type: String, subType: null },
				{ name: "ppt", type: app.domain.model.ppt.ProjectPlanningTool, subType: null },
				{ name: "project", type: app.domain.model.core.Project, subType: null },
				{ name: "requestBodyTemplate", type: String, subType: null }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null }
			]
		};

		public id: number;
		name: string;
		ppt: app.domain.model.ppt.ProjectPlanningTool;
		url: string;
		project: app.domain.model.core.Project;
		requestBodyTemplate: string;

		constructor(name:string, url:string, ppt:app.domain.model.ppt.ProjectPlanningTool, project:app.domain.model.core.Project, requestBodyTemplate:string) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
			this.url = url;
			this.ppt = ppt;
			this.project = project;
			this.requestBodyTemplate = requestBodyTemplate;
		}
	}
}