/// <reference path='TaskPropertyValue.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />

module core {
    'use strict';

    export class TaskTemplate implements core.PersistentEntity {
        // TODO: replace this ugly hack. This is only for first json import
        public static createFromJson(object: any): TaskTemplate {
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

		public getPropertieValuesByProperty(): {[index: string]: TaskPropertyValue } {
			var propertyValues: {[index: string]: TaskPropertyValue } = {};
			this.theProperties.forEach(function(propertyValue){
				propertyValues[propertyValue.property.name] = propertyValue;
			});
			return propertyValues;
		}

        public addProperty(property: TaskPropertyValue) {
            this.theProperties.push(property);
        }
    }
}