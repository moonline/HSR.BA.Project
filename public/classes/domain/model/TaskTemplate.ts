/// <reference path='../../../classes/domain/model/TaskProperty.ts' />

module core {
    'use strict';

    export class TaskTemplate {
        // TODO: replace this ugly hack. This is only for first json import
        public static createFromJson(object: any): TaskTemplate {
            object = new TaskTemplate(object.name, object.properties);

            object.theProperties.forEach(function(element){
                element = new TaskProperty(element.name);
            });
            return object;
        }


        public name:string;
        private theProperties: TaskProperty[];

        constructor(name: string, properties: TaskProperty[] = []) {
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