/// <reference path='../../../classes/domain/repository/Repository.ts' />
/// <reference path='../../../classes/domain/model/Decision.ts' />

module dks {
	export class DecisionRepository extends core.Repository<Decision> {
		constructor(httpService) {
			super(httpService);
			this.type = Decision;
			this.resources = {
				'all': 'data/dks/decision/list.json'
			};
		}
	}
}