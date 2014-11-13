/// <reference path='../../domain/model/Node.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='OptionTemplate.ts' />

module app.domain.model.dks {
	export class Problem implements app.domain.model.dks.Node, app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "name", type: String, subType: null },
				{ name: "alternatives", type: Array, subType: app.domain.model.dks.OptionTemplate }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null },
				{ name: "self", type: String, subType: null },
				{ name: "notes", type: String, subType: null },
				{ name: "attributes", type: Object, subType: null },
				{ name: "path", type: Array, subType: String }
			]
		};

		public id: number;
		public name: string;
		public notes: string;
		public self: string;
		public attibutes: Object;
		public path: string[];
		public options: app.domain.model.dks.OptionTemplate[];

		constructor(name: string, options: app.domain.model.dks.OptionTemplate[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
			this.options = options;
		}
	}
}