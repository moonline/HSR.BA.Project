/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module app.domain.model.dks {
	'use strict';

	export class DecisionKnowledgeSystem implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{name: "name", type: String, subType: null},
				{name: "url", type: String, subType: null}
			],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

		public name:string;
		public url: string;
		public id: number;

		constructor(name:string, url:string) {
			this.name = name;
			this.url = url;
		}
	}
}