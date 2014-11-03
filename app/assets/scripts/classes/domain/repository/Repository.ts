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
		 * if create resource is not defined, add element to the item cache,
		 * but return null to signal failed persistence
		 *
		 * @param item
		 * @param callback
		 */
		public add(item: T, callback: (item: T) => void): void {
			var method: string = 'post';

			if(this.resources['create']) {
				this.httpService[method](this.getResourcePath('create'), JSON.stringify(item))
					.success(function(data, status, headers, config) {
						callback(item);
					})
					.error(function(data, status, headers, config) {
						callback(null);
					});
			} else {
				this.itemCache.push(item);
				// TODO: return null
				callback(item);
			}
		}

		/**
		 * search by id on remote resource. Do not search in cache
		 * but update cache because user would like to get to get the newest data.
		 *
		 * @param id
		 * @param callback
		 */
		public findOneById(id: number, callback: (item: T) => void): void {
			var path:string = this.getResourcePath('one').replace('{id}', id.toString());
			var type = this.type;
			var method: string = 'get';

			if(this.resources['one']) {
				this.httpService[method](path).success(function(data){
					if(data && this.filter(data)) {
						var object = app.domain.factory.ObjectFactory.createFromJson(type, data);
						var itemCachePos: number = this.itemCache.indexOf(object);

						if(itemCachePos >= 0) {
							this.itemCache[itemCachePos] = object;
						} else {
							this.itemCache.push(object);
						}
						callback(object);
					} else {
						callback(null);
					}
				}.bind(this));
			} else {
				this.findOneBy('id', id, callback);
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
		 *
		 * @param propertyName
		 * @param property
		 * @param callback
		 */
		public findOneBy(propertyName: string, property: any, callback: (item: T) => void): void {
			this.findAll(function(items) {
				var foundItem: T = null;
				items.forEach(function(item){
					if(item[propertyName] && item[propertyName] === property) {
						foundItem = item;
					}
				});
				callback(foundItem);
			});
		}
	}
}