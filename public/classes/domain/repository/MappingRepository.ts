/// <reference path='../../../classes/domain/repository/Repository.ts' />
/// <reference path='../../../classes/domain/model/Mapping.ts' />

module core {
	export class MappingRepository extends core.Repository<Mapping> {
		constructor(httpService) {
			super(httpService);
			this.type = Mapping;
			this.resources = {
				'all': 'data/eeppi/mapping/list.json'
			};
		}
	}
}