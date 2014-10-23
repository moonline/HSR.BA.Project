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

		public findOneByDecision(decision: any, callback: (item: Mapping) => void): void {
			this.findAll(function(items) {
				items.forEach(function(item){
					if(item.decision === decision) {
						callback(item);
					} else {
						callback(null);
					}
				});
			});
		}
	}
}