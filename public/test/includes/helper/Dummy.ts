/// <reference path='../../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/factory/FactoryConfiguration.ts' />

module test.helper {
	export class Dummy implements app.domain.model.dks.Node, app.domain.repository.core.PersistentEntity {
		public static createDummy(id: number, name: string): Dummy {
			var dummy: Dummy = new Dummy(name);
			dummy.id = id;
			return dummy;
		}
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