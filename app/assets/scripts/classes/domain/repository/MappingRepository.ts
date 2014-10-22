/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Mapping.ts' />

module core {
	export class MappingRepository extends core.Repository<Mapping> {
		constructor(httpService) {
			super(httpService);
			this.type = Mapping;
			this.resources = {
				'all': configuration.paths.mapping.list
			};
		}
	}
}