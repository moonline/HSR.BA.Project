/// <reference path='TaskPropertyValue.ts' />

/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module app.domain.model.core {
    'use strict';

    export class TaskTemplate implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "name", type: String, subType: null },
				{ name: "properties", type: Array, subType: app.domain.model.core.TaskPropertyValue }
			],
			publicProperties: [
				{ name: "parent", type: Object, subType: null },
				{ name: "id", type: Number, subType: null }
			]
		};

		public id;
        public name:string;
        public properties: app.domain.model.core.TaskPropertyValue[];
		public parent:app.domain.model.core.TaskTemplate;

        constructor(name: string, properties: app.domain.model.core.TaskPropertyValue[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
            this.properties = properties;
			this.parent = null;
        }

		public hasProperty(property: app.domain.model.core.TaskProperty) {
			for(var pi in this.properties) {
				if(this.properties[pi].property.id == property.id) {
					return true;
				}
			}
			return false;
		}

    	public addProperty(property: app.domain.model.core.TaskPropertyValue) {
            this.properties.push(property);
        }

		public removeProperty(property: app.domain.model.core.TaskPropertyValue) {
			for(var pi in this.properties) {
				if(this.properties[pi].id == property.id) {
					this.properties.splice(pi,1);
				}
			}
		}
    }
}