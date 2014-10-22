/// <reference path='../repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='../../domain/model/TaskProperty.ts' />

module core {
    export class TaskPropertyValue implements core.PersistentEntity {
		public static factoryConfiguration: core.FactoryConfiguration = {
			constructorArguments: [
				{ name: "property", type: TaskProperty, subType: null },
				{ name: "value", type: String, subType: null }
			],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

		public id: number;
		public property: TaskProperty;
        public value: string;

        constructor(property: TaskProperty, value: string) {
			this.id = Math.round(Math.random()*1000000);
			this.property = property;
			this.value = value;
		}
    }
}