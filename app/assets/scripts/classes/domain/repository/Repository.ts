/// <reference path='PersistentEntity.ts' />
/// <reference path='../../../classes/domain/factory/ObjectFactory.ts' />

module core {
	export class Repository<T extends PersistentEntity> {
		// TypeScript generics does not allow to call a static method on type T, so we need the class as property
		type: any = null;
		itemCache: T[];

		public host: string = '';
		public dataList: string = 'items';
		public filter: (element: any) => boolean = function(element) { return true; };

		httpService;
		resources: { [index: string]: string } = {};

		constructor(httpService) {
			this.httpService = httpService;
			this.itemCache = [];
		}

		private getResourcePath(resource: string) {
			return this.host+this.resources[resource];
		}

		public findAll(callback: (items: T[]) => void): void {
			// TODO: Replace caching with real persistence
			if(this.itemCache.length > 0) {
				callback(this.itemCache);
			} else {
				var cache: T[] = this.itemCache;
				var type = this.type;
				var filter = this.filter;
				var dataList = this.dataList;

				this.httpService.get(this.getResourcePath('all')).success(function(data){
					var items: T[] = [];
					data[dataList].forEach(function(element){
						if(filter(element)) {
							items.push(ObjectFactory.createFromJson(type,element));
						}
					});
					[].push.apply(cache, items);
					callback(cache);
				});
			}
		}

		public add(item: T, callback: (item: T) => void): void {
			// TODO: Replace caching with real persistence
			this.itemCache.push(item);
			callback(item);
		}

		public findOneById(id: number, callback: (item: T) => void): void {
			this.findAll(function(items) {
				items.forEach(function(item){
					if(item.id === id) {
						callback(item);
					}
				});
			});
		}
	}
}