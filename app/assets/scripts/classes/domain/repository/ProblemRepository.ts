/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Problem.ts' />

module app.domain.repository.dks {
	export class ProblemRepository extends app.domain.repository.core.Repository<app.domain.model.dks.Problem> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.dks.Problem;
			this.resources = configuration.paths.problem;

			this.dataList = 'elements';
			this.proxy = configuration.paths.dks.remoteProxy;
		}
	}
}