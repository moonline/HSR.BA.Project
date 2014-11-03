/// <reference path='PersistentEntity.ts' />
/// <reference path='../../../classes/domain/factory/ObjectFactory.ts' />

module app.domain.repository.core {
	export class Repository<T extends app.domain.repository.core.PersistentEntity> {
		// TypeScript generics does not allow to call a static method on type T, so we need the class as property
		type: any = null;
		itemCache: T[];

		public host: string = '';
		// proxy path with {target} to be replaced by the remote url
		public proxy: string = null;
		public dataList: string = 'items';
		public filter: (element: any) => boolean = function(element) { return true; };

		httpService;
		resources: { [index: string]: string } = {};

		constructor(httpService) {
			this.httpService = httpService;
			this.itemCache = [];
		}

		private getResourcePath(resource: string) {
			if(this.proxy != null && this.proxy.indexOf("{target}") > -1) {
				return this.proxy.replace("{target}", encodeURIComponent(this.host+this.resources[resource]));
			} else {
				return this.host+this.resources[resource];
			}
		}

		public findAll(callback: (items: T[]) => void, doCache = false): void {
			var cache: T[] = this.itemCache;
			var filterFunction = this.filter;
			var type = this.type;
			var dataListName: string = this.dataList;

			if(doCache) {
				callback(cache);
			} else {
				var method: string = 'get';

				this.httpService[method](this.getResourcePath('all')).success(function(data){
					var items: T[] = [];
					if(data && data[dataListName]) {
						data[dataListName].forEach(function(element){
							if(filterFunction(element)) {

								console.log(element);
								items.push(app.domain.factory.ObjectFactory.createFromJson(type,element));
							}
						});
						while(cache.length > 0) {
							cache.pop();
						}
						items.forEach(function(item){
							cache.push(item);
						});
					}
					callback(cache);
				});
			}
		}

		/**
		 * add item
		 *
		 * the callback returns 'true, theObject' on success otherwise 'false, null'
		 */
		public add(item: T, callback: (success: boolean, item: T) => void): void {
			var method: string = 'post';
			var type = this.type;

			if(!this.resources['create']) {
				throw new Error("Please configure a 'create' resource for the" +this.type.name+" repository.");
			} else {
				this.httpService[method](this.getResourcePath('create'), JSON.stringify(item))
					.success(function(data, status, headers, config) {
						callback(true, app.domain.factory.ObjectFactory.createFromJson(type, data));
					})
					.error(function(data, status, headers, config) {
						callback(false, null);
					});
			}
		}

		/**
		 * search by id on remote resource. Do not search in cache
		 * but update cache because user would like to get to get the newest data.
		 */
		public findOneById(id: number, callback: (item: T) => void, doCache:boolean = false): void {
			var path:string = this.getResourcePath('one').replace('{id}', id.toString());
			var type = this.type;
			var method: string = 'get';
			var cache = this.itemCache;

			if(!this.resources['one']) {
				throw new Error("Please configure a 'detail' resource for the "+this.type+" repository.");
			} else {
				if(doCache) {
					this.findOneBy('id', id, callback, doCache);
				} else {
					this.httpService[method](path).success(function(data){
						if(data && this.filter(data)) {
							var object = app.domain.factory.ObjectFactory.createFromJson(type, data);
							var itemCachePos: number = cache.indexOf(object);

							if(itemCachePos >= 0) {
								cache[itemCachePos] = object;
							} else {
								cache.push(object);
							}
							callback(object);
						} else {
							callback(null);
						}
					});
				}
			}
		}

		public updateCache(): void {
			this.findAll(function(items){
				this.itemCache = items;
			}.bind(this));
		}

		/**
		 * search in local cache for item because loading all elements
		 * only to filter occours a lot of trafic
		 */
		public findOneBy(propertyName: string, property: any, callback: (item: T) => void, doCache: boolean = false): void {
			this.findAll(function(items) {
				var foundItem: T = null;
				items.forEach(function(item){
					if(item[propertyName] && item[propertyName] === property) {
						foundItem = item;
					}
				});
				callback(foundItem);
			}, doCache);
		}
	}
}