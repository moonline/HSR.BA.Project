/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Alternative.ts' />

module app.domain.repository.dks {
	export class AlternativeRepository extends app.domain.repository.core.Repository<app.domain.model.dks.Alternative> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.dks.Alternative;
			this.resources = configuration.paths.alternative;

			this.dataList = 'elements';
			this.proxy = configuration.paths.dks.remoteProxy;
		}
	}
}