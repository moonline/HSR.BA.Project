/// <reference path='../repository/PersistentEntity.ts' />
/// <reference path='../../domain/factory/FactoryConfiguration.ts' />

/// <reference path='../../domain/model/TaskProperty.ts' />

module app.domain.model.core {
    export class TaskPropertyValue implements app.domain.repository.core.PersistentEntity {
		public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
			constructorArguments: [
				{ name: "property", type: app.domain.model.core.TaskProperty, subType: null },
				{ name: "value", type: String, subType: null }
			],
			publicProperties: [{ name: "id", type: Number, subType: null }]
		};

		public id: number;
		public property: app.domain.model.core.TaskProperty;
        public value: string;

        constructor(property: app.domain.model.core.TaskProperty, value: string) {
			this.id = Math.round(Math.random()*1000000);
			this.property = property;
			this.value = value;
		}
    }
}