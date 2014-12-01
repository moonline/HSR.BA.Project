/// <reference path='../../includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/TaskPropertyRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/DecisionRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/MappingRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/DecisionKnowledgeSystemRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/ProblemRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/AlternativeRepository.ts' />

/// <reference path='../../../../app/assets/scripts/classes/application/MappingController.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/model/DecisionKnowledgeSystem.ts' />

module test.integration.application {
	export function MappingControllerTest() {
		describe("Mapping controller class suite", function() {
			var http, httpBackend, rootScope, persistenceService, sce;

			beforeEach(inject(function ($rootScope, $http, $httpBackend, $sce) {
				http = $http;
				httpBackend = $httpBackend;
				rootScope = $rootScope;
				sce = $sce;

				persistenceService = {
					taskTemplateRepository: new app.domain.repository.core.TaskTemplateRepository($http),
					taskPropertyRepository: new app.domain.repository.core.TaskPropertyRepository($http),
					mappingRepository: new app.domain.repository.core.MappingRepository($http),
					decisionKnowledgeSystemRepository: new app.domain.repository.dks.DecisionKnowledgeSystemRepository($http),
					alternativeRepository : new app.domain.repository.dks.AlternativeRepository($http),
					problemRepository: new app.domain.repository.dks.ProblemRepository($http)
				};

				persistenceService.decisionKnowledgeSystemRepository.resources['list']['url'] = '/rest/api/1/dks';
				persistenceService.taskTemplateRepository.resources['list']['url'] = '/rest/api/1/taskTemplate';
				persistenceService.taskPropertyRepository.resources['list']['url'] = '/rest/api/1/taskProperty';
				persistenceService.mappingRepository.resources['list']['url'] = '/rest/api/1/dksMapping';
			}));

			it("load problems and decisions from remote dks using dks sources", function() {
				// for this test taskTemplates and taskProperties are not relevant, so it works with an empty result
				httpBackend.expectGET('/rest/api/1/taskTemplate').respond({});
				httpBackend.expectGET('/rest/api/1/taskProperty').respond({});
				httpBackend.when('GET','/rest/api/1/mapping').respond({});


				httpBackend.when('GET','/rest/api/1/dks').respond({
					"items": [
						{
							"id": 1,
							"name": "The DKS",
							"url": "http://localhost:9940"
						}
					]
				});
				httpBackend.when('GET','/rest/api/1/dks/getFromDKS?url=http%3A%2F%2Flocalhost%3A9940%2Felement%3Fquery%3Dtype%2520is%2520%2522ProblemTemplate%2522').respond({
					"startAt": 0, "maxResults": 2147483647, "length": 9, "elements": [
					{
						"id": 1,
						"type": "ProblemTemplate",
						"path": ["Cloud Application", "DB Technologies", "DB Model"],
						"name": "DB Model",
						"self": "http://152.96.193.210:8080/element/Cloud+Application%2FDB+Technologies%2FDB+Model",
						"attributes": {},
						"notes": "",
						"alternatives": [
							{
								"id": 5,
								"type": "OptionTemplate",
								"path": ["Cloud Application", "DB Technologies", "Relational DB"],
								"name": "Relational DB",
								"self": "http://152.96.193.210:8080/element/Cloud+Application%2FDB+Technologies%2FRelational+DB"
							},
							{
								"id": 7,
								"type": "OptionTemplate",
								"path": ["Cloud Application", "DB Technologies", "Key/Value Store"],
								"name": "Key/Value Store",
								"self": "http://152.96.193.210:8080/element/Cloud+Application%2FDB+Technologies%2FKey%2F%2FValue+Store"
							}
						]
					}
				]});

				httpBackend.when('GET','/rest/api/1/dks/getFromDKS?url=http%3A%2F%2Flocalhost%3A9940%2Felement%3Fquery%3Dtype%2520is%2520%2522OptionTemplate%2522').respond({
					"elements": [
						{
							"id": 5,
							"type": "OptionTemplate",
							"path": ["Cloud Application", "DB Technologies", "Relational DB"],
							"name": "Relational DB",
							"self": "http://152.96.193.210:8080/element/Cloud+Application%2FDB+Technologies%2FRelational+DB"
						},
						{
							"id": 7,
							"type": "OptionTemplate",
							"path": ["Cloud Application", "DB Technologies", "Key/Value Store"],
							"name": "Key/Value Store",
							"self": "http://152.96.193.210:8080/element/Cloud+Application%2FDB+Technologies%2FKey%2F%2FValue+Store"
						}
					]
				});

				var scope = rootScope.$new();
				var controller: app.application.MappingController = new app.application.MappingController(scope, persistenceService, sce);
				httpBackend.flush();

				var dkSystem = new app.domain.model.dks.DecisionKnowledgeSystem("The DKS", "http://localhost:9940"); dkSystem.id = 1;
				expect(scope.currentDks).toEqual(dkSystem);

				expect(scope.problems.length).toEqual(1);
				expect(scope.problems[0].name).toEqual("DB Model");
				expect(scope.problems[0].alternatives.length).toEqual(2);
			})
		});
	}
}