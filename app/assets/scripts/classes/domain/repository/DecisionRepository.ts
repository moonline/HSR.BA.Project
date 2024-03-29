/// <reference path='../../../configuration/paths.ts' />

/// <reference path='../../domain/repository/Repository.ts' />
/// <reference path='../../domain/model/Decision.ts' />

module app.domain.repository.dks {
	export class DecisionRepository extends app.domain.repository.core.Repository<app.domain.model.dks.Decision> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.dks.Decision;
			this.resources = configuration.paths.decision;

			this.dataList = 'elements';
			this.proxy = configuration.paths.dks.remoteProxy;
		}
	}
}