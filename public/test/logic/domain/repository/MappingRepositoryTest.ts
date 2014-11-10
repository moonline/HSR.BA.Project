/// <reference path='../../../../../public/test/includes.ts' />

/// <reference path='../../../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/model/TaskTemplate.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/model/TaskProperty.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/model/Mapping.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/Repository.ts' />

module test.logic.domain.repository {
	export function MappingRepositoryTest() {
		describe("Mapping repository class suite", function(){
			it("Create Mapping", angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.expectPOST('/dksMapping').respond({
					"id":1302,
					"taskTemplate": {
						id: 24, "parent":null,"name":"Invite to decision meeting 2",
						properties: [] },
					"dksNode":3
				});
				var repository: app.domain.repository.core.MappingRepository = new app.domain.repository.core.MappingRepository($http);

				var decision: app.domain.model.dks.Decision = new app.domain.model.dks.Decision("Irgendwas");
				decision.id = 3;

				var taskTemplate: app.domain.model.core.TaskTemplate = new app.domain.model.core.TaskTemplate("Invite to decision meeting 2");
				taskTemplate.id = 24;

				var mapping: app.domain.model.core.Mapping = new app.domain.model.core.Mapping(decision, taskTemplate);
				mapping.id = 1302;

				var status;
				repository.add(mapping, function(success, item) {
					status = { status: success, item: item };
				});

				$httpBackend.flush();
				mapping.dksNode = 3;
				expect(status).toEqual({ status: true, item: mapping });
			}));
		});
	}
}