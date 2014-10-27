/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module dks {
	export class DecisionKnowledgeSystem implements core.PersistentEntity {
		public static factoryConfiguration: core.FactoryConfiguration = {
			constructorArguments: [{ name: "address", type: String, subType: null }],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

		public address: string;
		public id: number;

		constructor(address: string) {
			this.address = address;
			this.id = Math.round(Math.random()*1000000);
		}
	}
}