/// <reference path='Node.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module app.domain.model.dks {
	export class Option implements app.domain.model.dks.Node, app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [{ name: "name", type: String, subType: null }],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

		public id: number;
		public name: string;

		constructor(name: string) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
		}
	}
}