/// <reference path='../../../configuration/paths.ts' />

/// <reference path='../../domain/repository/Repository.ts' />
/// <reference path='../../domain/model/TaskTemplate.ts' />

module app.domain.repository.core {
    export class TaskTemplateRepository extends app.domain.repository.core.Repository<app.domain.model.core.TaskTemplate> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.core.TaskTemplate;
			this.resources = configuration.paths.taskTemplate;
		}

		/**
		 * Update all property values of a task template
		 *
		 * @param {app.domain.model.core.TaskTemplate} taskTemplate - The task template to update property values.
		 * @param {function} callback - The callback is called with (true) on success and with (false) on error.
		 */
		public updateProperties(taskTemplate: app.domain.model.core.TaskTemplate, callback: (success: boolean) => void) {
			if(!this.resources['updateProperty']) {
				throw new Error("Please configure a 'updateProperty' resource for the TaskTemplateRepository repository.");
			}
			var method: string = this.resources['updateProperty']['method'].toLowerCase();
			var url: string = this.getResourcePath('updateProperty').replace('{id}', taskTemplate.id.toString());
			var cache = this.itemCache;
			var cachePos:number = cache.indexOf(taskTemplate);
			var type = this.type;
			var httpService = this.httpService;

			// call callback after last update returned
			var statusCollector = {
				success: true,
				max: taskTemplate.properties.length,
				count: 0,
				callback: function(state: boolean) {
					if(!state) {
						statusCollector.success = false;
					}

					statusCollector.count++;
					if(statusCollector.count >= statusCollector.max) {
						callback(statusCollector.success);
					}
				}
			};

			// Angular mixes calls near at the same time up, so fire next call after return of last call
			var recursivPropertyUpdate = function(index: number, collection: app.domain.model.core.TaskPropertyValue[]) {
				if(index < collection.length) {
					var propertyValue: app.domain.model.core.TaskPropertyValue = collection[index];
					var propertyUrl: string = url.replace('{propertyId}', propertyValue.id.toString());

					httpService[method](propertyUrl, { property: propertyValue.property.id, value: propertyValue.value })
						.success(function(data, status, headers, config) {
							cache[cachePos] = app.domain.factory.ObjectFactory.createFromJson(type, data);
							recursivPropertyUpdate(index+1, collection);
							statusCollector.callback(true);
						})
						.error(function(data, status, headers, config) {
							recursivPropertyUpdate(index+1, collection);
							statusCollector.callback(false);
						});
				}
			};
			recursivPropertyUpdate(0,taskTemplate.properties);
		}

		/**
		 * Add a property value to a task template
		 *
		 * @param {app.domain.model.core.TaskTemplate} taskTemplate - The task template to update property values.
		 * @param {app.domain.model.core.TaskPropertyValue} propertyValue - Value to add
		 * @param {function} callback - The callback is called with (true. taskTemplate) on success and with (false, null) on error.
		 */
		public addPropertyValue(taskTemplate: app.domain.model.core.TaskTemplate, propertyValue: app.domain.model.core.TaskPropertyValue,
				callback: (status: boolean, taskTemplate: app.domain.model.core.TaskTemplate) => void) {
			var method: string = this.resources['addProperty']['method'].toLowerCase();
			var url: string = this.getResourcePath('addProperty').replace('{id}', taskTemplate.id.toString());
			var cache = this.itemCache;
			var type = this.type;
			var cachePos:number = cache.indexOf(taskTemplate);

			this.httpService[method](url, { property: propertyValue.property.id, value: propertyValue.value })
				.success(function(data, status, headers, config) {
					var updatedTaskTemplate: app.domain.model.core.TaskTemplate = app.domain.factory.ObjectFactory.createFromJson(type, data);
					cache[cachePos] = updatedTaskTemplate;
					callback(true, updatedTaskTemplate);
				})
				.error(function(data, status, headers, config) {
					callback(false, null);
				});
		}

		/**
		 * Remove property value
		 *
		 * @param {app.domain.model.core.TaskTemplate} taskTemplate - The task template to update property values.
		 * @param {app.domain.model.core.TaskPropertyValue} propertyValue - Value to add
		 * @param {function} callback - The callback is called with (true. taskTemplate) on success and with (false, null) on error.
		 */
		public removePropertyValue(taskTemplate: app.domain.model.core.TaskTemplate, propertyValue: app.domain.model.core.TaskPropertyValue,
				callback: (status: boolean, taskTemplate: app.domain.model.core.TaskTemplate) => void) {
			var method: string = this.resources['removeProperty']['method'].toLowerCase();
			var url: string = this.getResourcePath('removeProperty').replace('{id}', taskTemplate.id.toString()).replace('{propertyValueId}', propertyValue.id.toString());
			var cache = this.itemCache;
			var type = this.type;
			var cachePos:number = cache.indexOf(taskTemplate);

			this.httpService[method](url, {})
				.success(function(data, status, headers, config) {
					var updatedTaskTemplate: app.domain.model.core.TaskTemplate = app.domain.factory.ObjectFactory.createFromJson(type, data);
					cache[cachePos] = updatedTaskTemplate;
					callback(true, updatedTaskTemplate);
				})
				.error(function(data, status, headers, config) {
					callback(false, null);
				});
		}
    }
}