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

		public findByDksNode(dksNode: app.domain.model.dks.DksNode, callback: (success: boolean, items: app.domain.model.core.Mapping[]) => void, doCache: boolean = false): void {
			this.findAll(function(success, items) {
				var foundItems: app.domain.model.core.Mapping[] = [];
				items.forEach(function(item){
					if(item.dksNode && Number(item.dksNode) == dksNode['id']) {
						foundItems.push(item);
					}
				});
				callback(success, foundItems);
			}, doCache);
		}

		public add(item: app.domain.model.core.Mapping, callback: (success: boolean, item: app.domain.model.core.Mapping) => void): void {
			var method: string = this.resources['create']['method'].toLowerCase();
			var url: string = this.getResourcePath('create');
			var type = this.type;
			var cache = this.itemCache;

			if(!this.resources['create']) {
				throw new Error("Please configure a 'create' resource for the" +this.type.name+" repository.");
			} else {
				this.httpService[method](url, { dksNode: item.dksNode, taskTemplate: item.taskTemplate.id })
					.success(function(data, status, headers, config) {
						var newObject: app.domain.model.core.Mapping = app.domain.factory.ObjectFactory.createFromJson(type, data);
						cache.push(newObject);
						callback(true, newObject);
					})
					.error(function(data, status, headers, config) {
						callback(false, null);
					});
			}
		}
	}
}