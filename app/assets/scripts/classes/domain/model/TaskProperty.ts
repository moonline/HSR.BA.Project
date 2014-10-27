/// <reference path='../repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

module core {
    export class TaskProperty implements core.PersistentEntity {
		public static factoryConfiguration: core.FactoryConfiguration = {
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