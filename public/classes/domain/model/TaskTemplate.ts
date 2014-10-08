/// <reference path='../../../classes/domain/model/TaskProperty.ts' />
/// <reference path='../../../classes/domain/repository/PersistentEntity.ts' />

module core {
    'use strict';

    export class TaskTemplate implements core.PersistentEntity {
        // TODO: replace this ugly hack. This is only for first json import
        public static createFromJson(object: any): TaskTemplate {
			console.log(object);
			var taskProperties: TaskProperty[] = [];

			object.properties.forEach(function(element){
				taskProperties.push(TaskProperty.createFromJson(element));
			});
            var domainObject: TaskTemplate = new TaskTemplate(object.name, taskProperties);
			domainObject.id = object.id;

            return domainObject;
        }

		public id;
        public name:string;
        private theProperties: TaskProperty[];

        constructor(name: string, properties: TaskProperty[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
            this.theProperties = properties;
        }

        get properties():TaskProperty[] {
            return this.theProperties;
        }

        public addProperty(property: TaskProperty) {
            this.theProperties.push(property);
        }
    }
}