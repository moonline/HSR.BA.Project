/// <reference path='../../domain/repository/PersistentEntity.ts' />

module app.domain.model.ppt {
	export class ProjectPlanningTool implements app.domain.repository.core.PersistentEntity{
		url: string;
		account: string;
		password: string;
		public id: number;

		constructor(url: string, account: string, password: string) {
			this.id = Math.round(Math.random()*1000000);
			this.url = url;
			this.account = account;
			this.password = password;
		}
	}
}