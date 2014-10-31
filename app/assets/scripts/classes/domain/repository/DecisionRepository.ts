/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Decision.ts' />

module app.domain.repository.dks {
	export class DecisionRepository extends app.domain.repository.core.Repository<app.domain.model.dks.Decision> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.dks.Decision;
			this.resources = {
				'all': configuration.paths.decision.list
			};
			this.filter = function(element) { return element.type === "ProblemOccurrence"; };
			this.dataList = 'elements';
			this.proxy = configuration.paths.dks.remoteProxy;
		}
	}
}