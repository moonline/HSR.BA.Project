/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Decision.ts' />

module dks {
	export class DecisionRepository extends core.Repository<Decision> {
		constructor(httpService) {
			super(httpService);
			this.type = Decision;
			this.resources = {
				'all': configuration.paths.decision.list
			};
			this.filter = function(element) { return element.type === "ProblemOccurrence"; };
			this.dataList = 'elements';
			this.proxy = configuration.paths.dks.remoteProxy;
		}
	}
}