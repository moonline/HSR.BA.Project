/// <reference path='../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />

module test {
	export module helper {
		export class Dummy implements dks.Node, core.PersistentEntity {
			public static createFromJson(object: any): Dummy {
				var domainObject = new Dummy(object.name);
				domainObject.id = object.id;

				return domainObject;
			}

			public static createDummy(id: number, name: string): Dummy {
				var dummy: Dummy = new Dummy(name);
				dummy.id = id;
				return dummy;
			}

			public id: number;
			public name: string;

			constructor(name: string) {
				this.id = Math.round(Math.random()*1000000);
				this.name = name;
			}
		}
	}
}