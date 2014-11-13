/// <reference path='../../domain/model/DksNode.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='TaskTemplate.ts' />

module app.domain.model.core {
	export class Mapping implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "dksNode", type: Number, subType: null },
				{ name: "taskTemplate", type: app.domain.model.core.TaskTemplate, subType: null }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null }
			]
		};

		public id: number;
		public dksNode: Number;
		public taskTemplate: app.domain.model.core.TaskTemplate;

 		constructor(dksNode: Number, taskTemplate: app.domain.model.core.TaskTemplate = null) {
			this.id = Math.round(Math.random()*1000000);
			this.dksNode = dksNode;
			this.taskTemplate = taskTemplate;
		}
	}
}
