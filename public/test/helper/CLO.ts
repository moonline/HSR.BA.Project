/// <reference path='../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />

// factory configuration less objekt ;-)

module test {
	export module helper {
		export class CLO implements app.domain.model.dks.Node, app.domain.repository.core.PersistentEntity {
			public id: number;
			public name: string;

			constructor(name: string) {
				this.id = Math.round(Math.random()*1000000);
				this.name = name;
			}
		}
	}
}