/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='../../domain/model/ProjectPlanningTool.ts' />
/// <reference path='../../domain/model/User.ts' />

module app.domain.model.ppt {
	export class PPTAccount implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "user", type: app.domain.model.core.User, subType: null },
				{ name: "pptUsername", type: String, subType: null },
				{ name: "pptUrl", type: String, subType: null },
				{ name: "ppt", type: app.domain.model.ppt.ProjectPlanningTool, subType: null }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null }
			]
		};

		public id: number;
		pptUrl: string;
		pptUsername: string;
		pptPassword: string = null;
		user: app.domain.model.core.User;
		ppt: app.domain.model.ppt.ProjectPlanningTool;

		constructor(user: app.domain.model.core.User, pptUserName: string, pptUrl: string, ppt: app.domain.model.ppt.ProjectPlanningTool) {
			this.id = Math.round(Math.random()*1000000);
			this.user = user;
			this.pptUrl = pptUrl;
			this.pptUsername = pptUserName;
			this.ppt = ppt;
		}
	}
}