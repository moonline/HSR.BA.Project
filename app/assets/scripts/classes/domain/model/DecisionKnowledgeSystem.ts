/// <reference path='../../domain/repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module app.domain.model.dks {
	export class DecisionKnowledgeSystem implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
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