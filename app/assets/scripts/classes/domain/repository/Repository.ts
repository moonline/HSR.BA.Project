/// <reference path='../../../classes/domain/repository/PersistentEntity.ts' />
/// <reference path='../../../classes/domain/factory/ObjectFactory.ts' />

module app.domain.repository.core {
	export class Repository<T extends app.domain.repository.core.PersistentEntity> {
		// TypeScript generics does not allow to call a static method on type T, so we need the class as property
		type: any = null;
		itemCache: T[];

		/**
		 * The host url of the remote api, will be concatenated in front of the relative resource path.
		 * Should be used in combination of proxy or host has to allow cross origin calls.
		 *
		 * @example "http://dks.eeppi.ch"
		 */
		public host: string = '';

		/**
		 * Path with {target} to be replaced by the remote url.
		 * If proxy is set, /path/to/proxy/{http://example.host.tld/path/to/resource/} will be called instead of http://example.host.tld/path/to/resource/
		 *
		 * @example "/dks/getFromDKS?url={target}"
		 */
		public proxy: { url: string; } = null;

		/**
		 * Name of the item list inside the returned js object from remote api
		 *
		 * @example
		 * 	// api returns:
		 * 	{ "items": [
		 * 		{ "name": "item 1" }, { "name": "item 2" }
		 * 	] }
 		 */
		public dataList: string = 'items';

		/**
		 * Function to filter the items returned by the remote api
		 *
		 * @param element - The current item inside the items list
		 * @example
		 * 	function(element) {
		 *  	return element.type === "domain.model.Asset";
		 * 	}
		 */
		public filter: (element: any) => boolean = function(element) { return true; };

		httpService;

		/**
		 * Dictionary with resource paths
		 *
		 * @example
		 * 	{
		 *		list: 	{ method: 'GET', url: '/dksMapping' },
		 *		detail: { method: 'GET', url: '/dksMapping/{id}' },
		 *		create: { method: 'POST', url: '/dksMapping' },
		 *		update: { method: 'POST', url: '/dksMapping/{id}' },
		 *		remove: { method: 'POST', url: '/dksMapping/{id}/delete' }
		 *	}
		 */
		resources: { [index: string]: { method: string; url: string; } } = <any>{};

		/**
		 * @param httpService - Angular $http service, used to call a remote api
		 */
		constructor(httpService) {
			this.httpService = httpService;
			this.itemCache = [];
		}

		/**
		 * Get url for resource
		 *
		 * @param resource
		 * @returns path - Gets the path for the requested resource. Concatenates host & path and uses proxy of set
		 */
		public getResourcePath(resource: string):string {
			if(this.proxy != null && this.proxy.url.indexOf("{target}") > -1) {
				return this.proxy.url.replace("{target}", encodeURIComponent(this.host+this.resources[resource]['url']));
			} else {
				return this.host+this.resources[resource]['url'];
			}
		}

		/**
		 * Find all items in remote repository or local cache.
		 *
		 * @param callback - Will be called with (true, items) on success successful remote/cache call and with (false, []) on error
		 * @param doCache - Returns items from remote api and updates the items cache if false, returns items from local cache if true.
		 */
		public findAll(callback: (success: boolean, items: T[]) => void, doCache = false): void {
			var cache: T[] = this.itemCache;

			if(doCache) {
				callback(true, cache);
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
						// remove existing items using loop because assignment of empty list to
						//  temp. variable cache will assign a reference to a new list and not change itemCache
						while(cache.length > 0) {
							cache.pop();
						}
						items.forEach(function(item){
							cache.push(item);
						});
					} else {
						console.warn("No data or data have wrong format. specified dataListProperty: '"+dataListName+"', data: ",data);
					}
					callback(true, cache);
				}).error(function(data){
					callback(false, []);
				});
			}
		}

		/**
		 * Add an item to the remote collection and the cache using the remote api.
		 *
		 * @param item - The item to persist using the remote api
		 * @param callback - The callback is called with (true, item) on success and with (false, null) on error
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
		 * Search item by id on remote resource or in cache. Updates item in item cache on success.
		 *
		 * @param id - ID of the item
		 * @param callback - The callback is called with (true, item) on success and with (false, null) on error
		 * @param doCache - Returns item from remote api and updates the item in the cache if false, returns item from local cache if true.
		 */
		public findOneById(id: number, callback: (success: boolean, item: T) => void, doCache:boolean = false): void {
			var method: string = this.resources['detail']['method'].toLowerCase();
			var path:string = this.getResourcePath('one').replace('{id}', id.toString());
			var type = this.type;
			var cache = this.itemCache;

			if(!this.resources['detail']) {
				throw new Error("Please configure a 'detail' resource for the "+this.type+" repository.");
			} else {
				if(doCache) {
					this.findOneBy('id', id, callback, doCache);
				} else {
					this.httpService[method](path).success(function(data){
						if(data && this.filter(data)) {
							var object = app.domain.factory.ObjectFactory.createFromJson(type, data);
							var itemCachePos: number = cache.indexOf(object);

							// find item an replace it with fetched item because maybe the item was updated on remote
							if(itemCachePos >= 0) {
								cache[itemCachePos] = object;
							} else {
								cache.push(object);
							}
							callback(true, object);
						} else {
							callback(false, null);
						}
					});
				}
			}
		}

		/**
		 * Find an item by a property value
		 *
		 * @param propertyName - The name of the property of the item
		 * @param property - The value of the property to search
		 * @param callback - The callback is called with (true, item) on success and with (false, null) on error
		 * @param doCache - Returns item from remote api and updates the item in the cache if false, returns item from local cache if true.
		 */
		public findOneBy(propertyName: string, property: any, callback: (success: boolean, item: T) => void, doCache: boolean = false): void {
			this.findAll(function(success, items) {
				var foundItem: T = null;
				items.forEach(function(item){
					if(item[propertyName] && item[propertyName] === property) {
						foundItem = item;
					}
				});
				callback(true, foundItem);
			}, doCache);
		}

		/**
		 * Find an item by a property (object) id
		 *
		 * @param propertyName - The name of the property of the item
		 * @param property - The value of the property to search
		 * @param callback - The callback is called with (true, item) on success and with (false, null) on error
		 * @param doCache - Returns item from remote api and updates the item in the cache if false, returns item from local cache if true.
		 */
		public findOneByPropertyId(propertyName: string, property: any, callback: (success: boolean, item: T) => void, doCache: boolean = false): void {
			this.findAll(function(success, items) {
				var foundItem: T = null;
				items.forEach(function(item){
					if(item[propertyName] && item[propertyName].id && property.id && item[propertyName].id === property.id) {
						foundItem = item;
					}
				});
				callback(true, foundItem);
			}, doCache);
		}

		/**
		 * Find items by a property (object) id
		 *
		 * @param propertyName - The name of the property of the item
		 * @param property - The value of the property to search
		 * @param callback - The callback is called with (true, item) on success and with (false, null) on error
		 * @param doCache - Returns item from remote api and updates the item in the cache if false, returns item from local cache if true.
		 */
		public findByPropertyId(propertyName: string, property: any, callback: (success: boolean, items: T[]) => void, doCache: boolean = false): void {
			this.findAll(function(success, items) {
				var foundItems: T[] = [];
				items.forEach(function(item){
					if(item[propertyName] && item[propertyName].id && property.id && item[propertyName].id === property.id) {
						foundItems.push(item);
					}
				});
				callback(true, foundItems);
			}, doCache);
		}

		/**
		 * Remove item from remote collection and item cache
		 *
		 * @param item - The item to remove
		 * @param callback - The callback is called with (true) on success and with (false) on error
		 */
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
					var position: number = cache.indexOf(item);
					if(position >= 0) { cache.splice(cache.indexOf(item),1); }
				})
				.error(function(data, status, headers, config) {
					callback(false);
				});

		}

		/**
		 * Update item in remote collection
		 *
		 * @param item - The item to remove
		 * @param callback - The callback is called with (true, item) on success and with (false, null) on error
		 */
		public update(item: T, callback: (success: boolean, item: T) => void): void {
			if(!this.resources['update']) {
				throw new Error("Please configure a 'update' resource for the" +this.type.name+" repository.");
			}
			var method: string = this.resources['update']['method'].toLowerCase();
			var url: string = this.getResourcePath('update').replace('{id}', item.id.toString());
			var type = this.type;

			this.httpService[method](url, JSON.stringify(item))
				.success(function(data, status, headers, config) {
					app.domain.factory.ObjectFactory.updateFromJson(item, type, data);
					callback(true, item);
				})
				.error(function(data, status, headers, config) {
					callback(false, null);
				});
		}

		/**
		 * Find all items and its related properties
		 *
		 * @param propertyName - The name of the item property
		 * @param repository - The repository to fetch the the property
		 * @param callback - Will be called with (true, items) on success successful remote/cache call and with (false, []) on error
		 * @param doCache - Returns items from remote api and updates the item cache if false, returns items from local cache if true.
		 */
		public findAllWithNodesAndSubNodes<S extends app.domain.repository.core.PersistentEntity>(propertyName: string, repository: app.domain.repository.core.Repository<S>,
			callback: (success: boolean, items: T[]) => void, doCache = false) {
			var instance = this;

			this.findAll(function(success, nodes) {
				if(success) {
					instance.findSubNodes(nodes, propertyName, repository, callback);
				} else {
					callback(false, []);
				}
			}, doCache);
		}

		/**
		 * Find related properties of nodes
		 *
		 * @param nodes - A list with items to find its properties
		 * @param propertyName - The name of the item property
		 * @param repository - The repository to fetch the the property
		 * @param callback - Will be called with (true, items) on success successful remote/cache call and with (false, []) on error
		 * @param doCache - Returns items from remote api and updates the item cache if false, returns items from local cache if true.
		 */
		public findSubNodes<S extends app.domain.repository.core.PersistentEntity>(
				nodes: T[],
				propertyName: string,
				repository: app.domain.repository.core.Repository<S>,
				callback: (success: boolean, items: T[]) => void, doCache = false) {
			repository.findAll(function(success, subNodes){
				if(success) {
					var sortedSubNodes = {};
					subNodes.forEach(function(subNode: any){
						if(subNode && subNode.id) {
							sortedSubNodes[subNode.id] = subNode;
						}
					});

					nodes.forEach(function(node, nIndex){
						if(node[propertyName]) {
							// create new list, only add existing entities & subNode != undefined
							var newSubNodesList:S[] = [];
							node[propertyName].forEach(function(subNode: any, snIndex) {
								if(subNode && subNode.id && sortedSubNodes[subNode.id]) {
									newSubNodesList.push(sortedSubNodes[subNode.id]);
								}
							});
							nodes[nIndex][propertyName] = newSubNodesList;
						}
					});
					callback(true, nodes);
				} else {
					callback(false, []);
				}
			}, doCache);
		}
	}
}