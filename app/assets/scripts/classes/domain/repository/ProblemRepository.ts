/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Problem.ts' />

module app.domain.repository.dks {
	export class ProblemRepository extends app.domain.repository.core.Repository<app.domain.model.dks.Problem> {
		private persistenceService: any;

		constructor(httpService, persistenceService) {
			super(httpService);
			this.persistenceService = persistenceService;
			this.type = app.domain.model.dks.Problem;
			this.resources = configuration.paths.problem;

			this.dataList = 'elements';
			this.proxy = configuration.paths.dks.remoteProxy;
		}

		public findAllWithChildren(callback: (success: boolean, items: app.domain.model.dks.Problem[]) => void, doCache = false) {
			var persistenceService = this.persistenceService;

			this.findAll(function(success, problems) {
				if(success) {
					persistenceService['alternativeRepository'].findAll(function(success, alternatives){
						if(success) {
							var sortedAlternatives = {};
							alternatives.forEach(function(alternative){
								sortedAlternatives[alternative.id] = alternative;
							});

							problems.forEach(function(problem, pIndex){
								problem.alternatives.forEach(function(alternative, aIndex) {
									problems[pIndex].alternatives[aIndex] = sortedAlternatives[alternative.id];
								});
							});
							callback(true, problems);
						} else {
							callback(false, []);
						}
					});
				} else {
					callback(false, []);
				}
			}, doCache);
		}
	}
}