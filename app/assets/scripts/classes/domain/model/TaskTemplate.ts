/// <reference path='TaskPropertyValue.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module core {
    'use strict';

    export class TaskTemplate implements core.PersistentEntity {
		public static factoryConfiguration: core.FactoryConfiguration = {
			constructorArguments: [
				{ name: "name", type: String, subType: null },
				{ name: "properties", type: Array, subType: core.TaskPropertyValue }
			],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

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