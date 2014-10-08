/// <reference path='../../../classes/domain/model/TaskPropertyValue.ts' />
/// <reference path='../../../classes/domain/repository/PersistentEntity.ts' />

module core {
    'use strict';

    export class TaskTemplate implements core.PersistentEntity {
        // TODO: replace this ugly hack. This is only for first json import
        public static createFromJson(object: any): TaskTemplate {
			console.log(object);
			var taskProperties: TaskPropertyValue[] = [];

			object.properties.forEach(function(element){
				taskProperties.push(TaskPropertyValue.createFromJson(element));
			});
            var domainObject: TaskTemplate = new TaskTemplate(object.name, taskProperties);
			domainObject.id = object.id;

            return domainObject;
        }

		public id;
        public name:string;
        private theProperties: TaskPropertyValue[];

        constructor(name: string, properties: TaskPropertyValue[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
            this.theProperties = properties;
        }

        get properties():TaskPropertyValue[] {
            return this.theProperties;
        }

        public addProperty(property: TaskPropertyValue) {
            this.theProperties.push(property);
        }
    }
}