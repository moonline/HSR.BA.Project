/// <reference path='../../domain/model/Node.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='Option.ts' />

module app.domain.model.dks {
	export class Decision implements app.domain.model.dks.Node, app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "name", type: String, subType: null },
				{ name: "alternatives", type: Array, subType: Option }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null },
				{ name: "state", type: String, subType: null }
			]
		};

		public id: number;
		public name: string;
		public options: Option[];
		public state: string;

		constructor(name: string, options: Option[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
			this.options = options;
		}
	}
}