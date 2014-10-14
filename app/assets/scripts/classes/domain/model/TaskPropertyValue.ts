/// <reference path='../repository/PersistentEntity.ts' />

/// <reference path='../../domain/model/TaskProperty.ts' />

module core {
    export class TaskPropertyValue implements core.PersistentEntity {
		// TODO: replace this ugly hack. This is only for first json import
		public static createFromJson(object: any): TaskPropertyValue {
			var domainObject: TaskPropertyValue = new TaskPropertyValue(TaskProperty.createFromJson(object.property), object.value);
			domainObject.id = object.id;

			return domainObject;
		}

		public id: number;
		public property: TaskProperty;
        public value: string;

        constructor(property: TaskProperty, value: string) {
			this.id = Math.round(Math.random()*1000000);
			this.property = property;
			this.value = value;
		}
    }
}