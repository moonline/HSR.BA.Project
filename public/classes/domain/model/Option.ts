/// <reference path='../../../classes/domain/model/Node.ts' />
/// <reference path='../../../classes/domain/repository/PersistentEntity.ts' />

module dks {
	export class Option implements Node, core.PersistentEntity {
		// TODO: replace this ugly hack. This is only for first json import
		public static createFromJson(object: any): Option {
			var domainObject = new Option(object.name);
			domainObject.id = object.id;

			return domainObject;
		}

		public id: number;
		public name: string;

		constructor(name: string) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
		}
	}
}