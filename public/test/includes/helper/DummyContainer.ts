/// <reference path='Dummy.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/factory/FactoryConfiguration.ts' />


module test.helper {
		export class DummyContainer {
			public static create(id: number, dummies: Dummy[], labels: string[], data: any) {
				var dummyContainer: DummyContainer = new DummyContainer(dummies, labels);
				dummyContainer.id = id;
				dummyContainer.data = data;
				return dummyContainer;
			}
			public static factoryConfiguration: app.domain.factory.FactoryConfiguration = {
				constructorArguments: [
					{ name: "dummies", type: Array, subType: Dummy },
					{ name: "labels", type: Array, subType: String }
				],
				publicProperties: [
					{ name: "id", type: Number, subType: null },
					{ name: "data", type: Object, subType: null }
				]
			};

			public id: number;
			private dummies: Dummy[];
			private labels: string[]
			private size: number;
			private data: any;

			constructor(dummies: Dummy[], labels: string[]) {
				this.id = Math.round(Math.random()*1000);
				this.data = { a: 1, b: 2 };
				this.dummies = dummies;
				this.size = dummies.length || 0;
				this.labels = labels;
			}
		}

}