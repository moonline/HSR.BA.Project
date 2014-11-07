/// <reference path='../../../../../public/test/includes.ts' />

/// <reference path='../../../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/model/TaskTemplate.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/model/TaskProperty.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/model/TaskPropertyValue.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/Repository.ts' />

module test.logic.domain.repository {
	export function TaskTemplateRepositoryTest() {
		describe("TaskTemplate class suite", function(){
			it("Update TaskTemplate", angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.expectPOST('/taskTemplate/5/properties/9').respond({
					"id":5,"dksNode":[],"parent":null,"name":"Invite to decision meeting 2",
					"properties":[
						{"id":9,"property":{"id":2,"name":"Type"},"value":"Sub Task"}
					]
				});
				var repository: app.domain.repository.core.TaskTemplateRepository = new app.domain.repository.core.TaskTemplateRepository($http);

				var propertyType: app.domain.model.core.TaskProperty = new app.domain.model.core.TaskProperty("Type");
				propertyType.id = 2;

				var taskTemplate = new app.domain.model.core.TaskTemplate("Invite to decision meeting 2");
				taskTemplate.id = 5;
				taskTemplate.addProperty(new app.domain.model.core.TaskPropertyValue(propertyType, "Sub Task"));
				taskTemplate.properties[0].id = 9;

				var status;
				repository.updateProperties(taskTemplate, function(state){ status = state });

				$httpBackend.flush();
				expect(status).toEqual(true);
			}));

			it("Add TaskTemplate property", angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.expectPOST('/taskTemplate/5/addProperty').respond({
					"id":5,"dksNode":[],"parent":null,"name":"Invite to decision meeting",
					"properties":[
						{"id":9,"property":{"id":2,"name":"Type"},"value":"Sub Task"}
					]
				});
				var repository: app.domain.repository.core.TaskTemplateRepository = new app.domain.repository.core.TaskTemplateRepository($http);

				var propertyType: app.domain.model.core.TaskProperty = new app.domain.model.core.TaskProperty("Type");
				propertyType.id = 2;

				var taskTemplate = new app.domain.model.core.TaskTemplate("Invite to decision meeting");
				taskTemplate.id = 5;
				var newPropertyValue = new app.domain.model.core.TaskPropertyValue(propertyType, "Sub Task");
				newPropertyValue.id = 9;
				taskTemplate.addProperty(newPropertyValue);

				var status;
				var updatedTaskTemplate;
				repository.addPropertyValue(taskTemplate, newPropertyValue, function(state, taskTemplate){ status = state; updatedTaskTemplate = taskTemplate; });

				$httpBackend.flush();
				expect(status).toEqual(true);
				expect(updatedTaskTemplate).toEqual(taskTemplate);
			}));

			it("Remove TaskTemplate property", angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.expectPOST('/taskTemplate/5/properties/9/delete').respond({
					"id":5,"dksNode":[],"parent":null,"name":"Invite to decision meeting",
					"properties":[]
				});
				var repository: app.domain.repository.core.TaskTemplateRepository = new app.domain.repository.core.TaskTemplateRepository($http);

				var propertyType: app.domain.model.core.TaskProperty = new app.domain.model.core.TaskProperty("Type");
				propertyType.id = 2;

				var taskTemplate = new app.domain.model.core.TaskTemplate("Invite to decision meeting");
				taskTemplate.id = 5;
				var newPropertyValue = new app.domain.model.core.TaskPropertyValue(propertyType, "Sub Task");
				newPropertyValue.id = 9;
				taskTemplate.addProperty(newPropertyValue);

				var status;
				var updatedTaskTemplate;
				repository.removePropertyValue(taskTemplate, newPropertyValue, function(state, taskTemplate){ status = state; updatedTaskTemplate = taskTemplate; });

				$httpBackend.flush();

				taskTemplate.removeProperty(newPropertyValue);
				expect(status).toEqual(true);
				expect(updatedTaskTemplate).toEqual(taskTemplate);
			}));
		});
	}
}