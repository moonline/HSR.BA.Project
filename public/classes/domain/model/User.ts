/// <reference path='../../../classes/domain/repository/PersistentEntity.ts' />

module core {
	export class User implements core.PersistentEntity {

		public id: number;
		public userName: string;

		constructor(userName: string) { this.userName = userName; }
	}
}