/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Problem.ts' />

module dks {
	export class ProblemRepository extends core.Repository<Problem> {
		constructor(httpService) {
			super(httpService);
			this.type = Problem;
			this.resources = {
				'all': configuration.paths.problem.list
			};
			this.filter = function(element) { return element.type === "ProblemTemplate"; };
			this.dataList = 'elements';
		}
	}
}