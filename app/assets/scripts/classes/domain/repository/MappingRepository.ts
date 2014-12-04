/// <reference path='../../../configuration/paths.ts' />

/// <reference path='../../domain/repository/Repository.ts' />

/// <reference path='../../domain/model/DksNode.ts' />
/// <reference path='../../domain/model/Mapping.ts' />

module app.domain.repository.core {
	export class MappingRepository extends app.domain.repository.core.Repository<app.domain.model.core.Mapping> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.core.Mapping;
			this.resources = configuration.paths.mapping;
		}

		/**
		 * Find items by its DKS Node relation by searching in list of all entities
		 *
		 * @param dksNode - The related DKS Node
		 * @param callback - Will be called with (true, items) on success successful remote/cache call and with (false, []) on error
		 * @param doCache - Returns items from remote api and updates the item cache if false, returns items from local cache if true.
		 */
		public findByDksNode(dksNode: app.domain.model.dks.DksNode, callback: (success: boolean, items: app.domain.model.core.Mapping[]) => void, doCache: boolean = false): void {
			if(dksNode && dksNode['id']) {
				this.findAll(function(success, items) {
					var foundItems: app.domain.model.core.Mapping[] = [];
					items.forEach(function(item){
						if(item.dksNode && Number(item.dksNode) == dksNode['id']) {
							foundItems.push(item);
						}
					});
					callback(success, foundItems);
				}, doCache);
			} else {
				callback(false, []);
			}
		}
	}
}