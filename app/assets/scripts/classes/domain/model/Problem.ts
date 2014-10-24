/// <reference path='../../domain/model/Node.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='OptionTemplate.ts' />

module dks {
	export class Problem implements dks.Node, core.PersistentEntity {
		public static factoryConfiguration: core.FactoryConfiguration = {
			constructorArguments: [
				{ name: "name", type: String, subType: null },
				{ name: "alternatives", type: Array, subType: OptionTemplate }
			],
			publicProperties: [
				{ name: "id", type: Number, subType: null },
				{ name: "notes", type: String, subType: null }
			]
		};

		public id: number;
		public name: string;
		public notes: string;
		public options: OptionTemplate[];

		constructor(name: string, options: OptionTemplate[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
			this.options = options;
		}
	}
}