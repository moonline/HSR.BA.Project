/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Mapping.ts' />

module core {
	export class MappingRepository extends core.Repository<Mapping> {
		constructor(httpService) {
			super(httpService);
			this.type = Mapping;
			this.resources = {
				'all': 'public/temporaryDevelopmentData/eeppi/mapping/list.json'
			};
		}
	}
}