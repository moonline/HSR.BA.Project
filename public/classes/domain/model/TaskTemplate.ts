/// <reference path='../../../classes/domain/model/TaskProperty.ts' />

module core {
    'use strict';

    export class TaskTemplate {
        public name:string;
        private theProperties: TaskProperty[];

        constructor(name: string, properties: TaskProperty[]) {
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