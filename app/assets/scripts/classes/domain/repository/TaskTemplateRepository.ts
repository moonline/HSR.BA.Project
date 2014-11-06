/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/TaskTemplate.ts' />

module app.domain.repository.core {
    export class TaskTemplateRepository extends app.domain.repository.core.Repository<app.domain.model.core.TaskTemplate> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.core.TaskTemplate;
			this.resources = configuration.paths.taskTemplate;
		}

		public updateProperties(taskTemplate: app.domain.model.core.TaskTemplate, callback: (status: boolean) => void) {
			if(!this.resources['updateProperty']) {
				throw new Error("Please configure a 'updateProperty' resource for the TaskTemplateRepository repository.");
			}
			var method: string = this.resources['updateProperty']['method'].toLowerCase();
			var url: string = this.getResourcePath('updateProperty').replace('{id}', taskTemplate.id.toString());
			var cache = this.itemCache;
			var cachePos:number = cache.indexOf(taskTemplate);

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

			taskTemplate.properties.forEach(function(propertyValue, index) {
				var propertyUrl: string = url.replace('{propertyId}', propertyValue.id.toString());

				this.httpService[method](propertyUrl, { property: propertyValue.property.id, value: propertyValue.value })
					.success(function(data, status, headers, config) {
						var updatedTaskTemplate: app.domain.model.core.TaskTemplate = app.domain.factory.ObjectFactory.createFromJson(app.domain.model.core.TaskTemplate, data);
						cache[cachePos] = updatedTaskTemplate;
						statusCollector.callback(true);
					})
					.error(function(data, status, headers, config) {
						statusCollector.callback(false);
					});
			}.bind(this));
		}
    }
}