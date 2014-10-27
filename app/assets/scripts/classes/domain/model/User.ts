/// <reference path='../repository/PersistentEntity.ts' />
/// <reference path='../factory/FactoryConfiguration.ts' />

module core {
	export class User implements core.PersistentEntity {
		public static isCompatibleObject(object: any) {
			return typeof object.name === 'string' && typeof object.id === 'number';
		}
		public static factoryConfiguration: core.FactoryConfiguration = {
			constructorArguments: [{ name: "name", type: String, subType: null }],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

		public id: number;
		public userName: string;

		constructor(userName: string) { this.userName = userName; }


	}
}