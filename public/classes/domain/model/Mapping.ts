/// <reference path='../../../classes/domain/model/TaskTemplate.ts' />
/// <reference path='../../../classes/domain/model/Decision.ts' />
/// <reference path='../../../classes/domain/repository/PersistentEntity.ts' />

module core {
	export class Mapping implements core.PersistentEntity {
		// TODO: replace this ugly hack. This is only for first json import
		public static createFromJson(object: any): Mapping {
			var taskTemplates: TaskTemplate[] = [];
			object.taskTemplates.forEach(function(element) {
				taskTemplates.push(TaskTemplate.createFromJson(element));
			});

			var domainObject: Mapping = new Mapping(dks.Decision.createFromJson(object.decision), taskTemplates);
			domainObject.id = object.id;

			return domainObject;
		}

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
