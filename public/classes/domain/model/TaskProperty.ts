/// <reference path='../../../classes/domain/repository/PersistentEntity.ts' />

module core {
    export class TaskProperty implements core.PersistentEntity {
		// TODO: replace this ugly hack. This is only for first json import
		public static createFromJson(object: any): TaskProperty {
			var domainObject: TaskProperty = new TaskProperty(object.name);
			domainObject.id = object.id;

			return domainObject;
		}

		public id: number;
        public name: string;

        constructor(name: string) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
		}
    }
}