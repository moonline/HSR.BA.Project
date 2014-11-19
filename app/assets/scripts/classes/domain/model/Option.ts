/// <reference path='Node.ts' />
/// <reference path='../../domain/model/DksNode.ts' />
/// <reference path='../../domain/model/Problem.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module app.domain.model.dks {
	export class Option extends DksNode implements app.domain.model.dks.Node, app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "name", type: String, subType: null },
				{ name: "path", type: Array, subType: String },
				{ name: "attributes", type: Object, subType: null },
				{ name: "notes", type: String, subType: null }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null },
				{ name: "self", type: String, subType: null },
				{ name: "template", type: app.domain.model.dks.Alternative, subType: null },
				{ name: "state", type: String, subType: null }
			]
		};

		public template: app.domain.model.dks.Alternative;
		public state: string;

		constructor(name: string, path: string[], attributes: Object, notes: string) {
			super(name, path, attributes, notes);
		}
	}
}