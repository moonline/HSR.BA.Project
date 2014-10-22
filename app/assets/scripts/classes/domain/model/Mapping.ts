/// <reference path='../../domain/model/Decision.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='TaskTemplate.ts' />

module core {
	export class Mapping implements core.PersistentEntity {
		public static factoryConfiguration: core.FactoryConfiguration = {
			constructorArguments: [
				{ name: "decision", type: dks.Decision, subType: null },
				{ name: "taskTemplates", type: Array, subType: core.TaskTemplate }
			],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

		public id: number;
		public decision: dks.Decision;
		public taskTemplates: core.TaskTemplate[];

 		constructor(decision: dks.Decision, taskTemplates: core.TaskTemplate[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.decision = decision;
			this.taskTemplates = taskTemplates;
		}

		public addTaskTemplate(taskTemplate: core.TaskTemplate): void {
			this.taskTemplates.push(taskTemplate);
		}
	}
}
