/// <reference path='PersistentEntity.ts' />
/// <reference path='../../../classes/domain/factory/ObjectFactory.ts' />

module app.domain.repository.core {
	export class Repository<T extends app.domain.repository.core.PersistentEntity> {
		// TypeScript generics does not allow to call a static method on type T, so we need the class as property
		type: any = null;
		itemCache: T[];

		public host: string = '';
		// proxy path with {target} to be replaced by the remote url
		public proxy: { url: string; } = null;
		public dataList: string = 'items';
		public filter: (element: any) => boolean = function(element) { return true; };

		httpService;
		resources: { [index: string]: { method: string; url: string; } } = <any>{};

		constructor(httpService) {
			this.httpService = httpService;
			this.itemCache = [];
		}

		public getResourcePath(resource: string) {
			if(this.proxy != null && this.proxy.url.indexOf("{target}") > -1) {
				return this.proxy.url.replace("{target}", encodeURIComponent(this.host+this.resources[resource]['url']));
			} else {
				return this.host+this.resources[resource]['url'];
			}
		}

		public findAll(callback: (items: T[]) => void, doCache = false): void {
			var cache: T[] = this.itemCache;

			if(doCache) {
				callback(cache);
			} else {
				var filterFunction = this.filter;
				var type = this.type;
				var dataListName: string = this.dataList;
				var method: string = this.resources['list']['method'].toLowerCase();
				var url: string = this.getResourcePath('list');

				this.httpService[method](url).success(function(data){
					var items: T[] = [];
					if(data && data[dataListName]) {
						data[dataListName].forEach(function(element){
							if(filterFunction(element)) {
								items.push(app.domain.factory.ObjectFactory.createFromJson(type,element));
							}
						});
						while(cache.length > 0) {
							cache.pop();
						}
						items.forEach(function(item){
							cache.push(item);
						});
					} else {
						console.warn("No data or data in false format returned. specified dataListProperty: '"+dataListName+"', data: ",data);
					}
					callback(cache);
				}).error(function(data){
					callback(null);
				});
			}
		}

		/**
		 * add item
		 *
		 * the callback returns 'true, theObject' on success otherwise 'false, null'
		 */
		public add(item: T, callback: (success: boolean, item: T) => void): void {
			var method: string = this.resources['create']['method'].toLowerCase();
			var url: string = this.getResourcePath('create');
			var type = this.type;
			var cache = this.itemCache;

			if(!this.resources['create']) {
				throw new Error("Please configure a 'create' resource for the" +this.type.name+" repository.");
			} else {
				this.httpService[method](url, JSON.stringify(item))
					.success(function(data, status, headers, config) {
						var newObject: T = app.domain.factory.ObjectFactory.createFromJson(type, data);
						cache.push(newObject);
						callback(true, newObject);
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
			var method: string = this.resources['detail']['method'].toLowerCase();
			var path:string = this.getResourcePath('one').replace('{id}', id.toString());
			var type = this.type;
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

		public remove(item: T, callback: (success: boolean) => void): void {
			if(!this.resources['remove']) {
				throw new Error("Please configure a 'remove' resource for the" +this.type.name+" repository.");
			}
			var method: string = this.resources['remove']['method'].toLowerCase();
			var url: string = this.getResourcePath('remove').replace('{id}', item.id.toString());
			var type = this.type;
			var cache = this.itemCache;

			this.httpService[method](url, {})
				.success(function(data, status, headers, config) {
					callback(true);
				})
				.error(function(data, status, headers, config) {
					callback(false);
				});

		}

		public update(item: T, callback: (success: boolean, item: T) => void): void {
			if(!this.resources['update']) {
				throw new Error("Please configure a 'update' resource for the" +this.type.name+" repository.");
			}
			var method: string = this.resources['update']['method'].toLowerCase();
			var url: string = this.getResourcePath('update').replace('{id}', item.id.toString());
			var type = this.type;
			var cache = this.itemCache;

			this.httpService[method](url, JSON.stringify(item))
				.success(function(data, status, headers, config) {
					var newObject: T = app.domain.factory.ObjectFactory.createFromJson(type, data);
					var cacheObjectIndex: number = cache.indexOf(item);
					cache[cacheObjectIndex] = newObject;
					callback(true, newObject);
				})
				.error(function(data, status, headers, config) {
					callback(false, null);
				});
		}
	}
}