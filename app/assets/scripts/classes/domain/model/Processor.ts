/// <reference path='../../domain/model/Project.ts' />
/// <reference path='../../domain/model/TaskTemplate.ts' />

/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module app.domain.model.core {
	'use strict';

	export class Processor implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "name", type: String, subType: null },
				{ name: "project", type: app.domain.model.core.Project, subType: null },
				{ name: "code", type: String, subType: null }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null }
			]
		};

		public id: number;
		public name: string;
        public project: app.domain.model.core.Project;
		public code: string;

 		constructor(name: string, project: app.domain.model.core.Project, code: string) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
			this.project = project;
			this.code = code;
		}
	}
}
