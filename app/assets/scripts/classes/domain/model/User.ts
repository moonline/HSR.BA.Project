/// <reference path='../repository/PersistentEntity.ts' />

module core {
	export class User implements core.PersistentEntity {
		public static isCompatibleObject(object: any) {
			return typeof object.name === 'string' && typeof object.id === 'number';
		}

		// TODO: replace this ugly hack. This is only for first json import
		public static createFromJson(object: any): User {
			var domainObject = new User(object.name);
			domainObject.id = object.id;

			return domainObject;
		}

		public id: number;
		public userName: string;

		constructor(userName: string) { this.userName = userName; }


	}
}