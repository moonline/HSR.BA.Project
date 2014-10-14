/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Decision.ts' />

module dks {
	export class DecisionRepository extends core.Repository<Decision> {
		constructor(httpService) {
			super(httpService);
			this.type = Decision;
			this.resources = {
				'all': 'public/temporaryDevelopmentData/dks/decision/list.json'
			};
		}
	}
}