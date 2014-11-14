/// <reference path='../../domain/model/Node.ts' />
/// <reference path='../../domain/model/DksNode.ts' />
/// <reference path='../../domain/model/Problem.ts' />

/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='Option.ts' />

module app.domain.model.dks {
	export class Decision extends app.domain.model.dks.DksNode implements app.domain.model.dks.Node, app.domain.repository.core.PersistentEntity {
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
				{ name: "alternatives", type: Array, subType: app.domain.model.dks.Option },
				{ name: "template", type: app.domain.model.dks.Problem, subType: null },
				{ name: "state", type: String, subType: null }
			]
		};

		public alternatives: app.domain.model.dks.Option[];
		public template: app.domain.model.dks.Problem;
		public state: string;

		constructor(name: string, path: string[], attributes: Object, notes: string) {
			super(name, path, attributes, notes);
		}
	}
}