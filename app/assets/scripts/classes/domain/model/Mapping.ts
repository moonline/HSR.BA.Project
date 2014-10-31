/// <reference path='../../domain/model/Decision.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='TaskTemplate.ts' />

module app.domain.model.core {
	export class Mapping implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "decision", type: app.domain.model.dks.Decision, subType: null },
				{ name: "taskTemplates", type: Array, subType: app.domain.model.core.TaskTemplate }
			],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

		public id: number;
		public decision: app.domain.model.dks.Decision;
		public taskTemplates: app.domain.model.core.TaskTemplate[];

 		constructor(decision: app.domain.model.dks.Decision, taskTemplates: app.domain.model.core.TaskTemplate[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.decision = decision;
			this.taskTemplates = taskTemplates;
		}

		public addTaskTemplate(taskTemplate: app.domain.model.core.TaskTemplate): void {
			this.taskTemplates.push(taskTemplate);
		}
	}
}
