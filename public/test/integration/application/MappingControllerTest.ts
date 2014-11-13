/// <reference path='../../includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/TaskPropertyRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/DecisionRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/MappingRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/DecisionKnowledgeSystemRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/ProblemRepository.ts' />

/// <reference path='../../../../app/assets/scripts/classes/application/MappingController.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/model/DecisionKnowledgeSystem.ts' />

module test.integration.application {
	export function MappingControllerTest() {
		describe("Mapping controller class suite", function() {
			var http, httpBackend, rootScope, persistenceService;

			beforeEach(inject(function ($rootScope, $http, $httpBackend) {
				http = $http;
				httpBackend = $httpBackend;
				rootScope = $rootScope;

				persistenceService = {
					taskTemplateRepository: new app.domain.repository.core.TaskTemplateRepository($http),
					taskPropertyRepository: new app.domain.repository.core.TaskPropertyRepository($http),
					mappingRepository: new app.domain.repository.core.MappingRepository($http),
					decisionKnowledgeRepository: new app.domain.repository.dks.DecisionKnowledgeSystemRepository($http),
					problemRepository: new app.domain.repository.dks.ProblemRepository($http)
				};
				persistenceService.decisionKnowledgeRepository.resources['list']['url'] = '/dks/decisionKnowledgeSystem';
				persistenceService.taskTemplateRepository.resources['list']['url'] = '/taskTemplate';
				persistenceService.taskPropertyRepository.resources['list']['url'] = '/taskProperty';
				persistenceService.mappingRepository.resources['list']['url'] = '/mapping';
			}));

			it("load problems and decisions from remote dks using dks sources", function() {
				// for this test taskTemplates and taskProperties are not relevant, so it works with an empty result
				httpBackend.expectGET('/taskTemplate').respond({});
				httpBackend.expectGET('/taskProperty').respond({});
				httpBackend.when('GET','/mapping').respond({});


				httpBackend.when('GET','/dks/decisionKnowledgeSystem').respond({
					"items": [
						{
							"id": 1,
							"address": "http://localhost:9940"
						}
					]
				});
				httpBackend.when('GET','/dks/getFromDKS?url='+encodeURIComponent('http://localhost:9940/element')).respond({
					"startAt": 0, "maxResults": 2147483647, "length": 9, "elements": [
					{
						"type": "OptionTemplate",
						"path": ["Cloud Application", "Session Management", "Server Session State"],
						"name": "Server Session State",
						"self": "http://152.96.193.210:8080/element/Cloud+Application%2FSession+Management%2FServer+Session+State",
						"attributes": {
							"IPR Classification": "Open"
						},
						"notes": "Keep session state on web server\r\n\r\n# Pros\r\n\r\n* ...\r\n* ..."
					},
					{
						"type": "ProblemTemplate",
						"path": ["Cloud Application", "DB Technologies", "DB Model"],
						"name": "DB Model",
						"self": "http://152.96.193.210:8080/element/Cloud+Application%2FDB+Technologies%2FDB+Model",
						"attributes": {},
						"notes": "",
						"alternatives": [
							{
								"type": "OptionTemplate",
								"path": ["Cloud Application", "DB Technologies", "Relational DB"],
								"name": "Relational DB",
								"self": "http://152.96.193.210:8080/element/Cloud+Application%2FDB+Technologies%2FRelational+DB"
							},
							{
								"type": "OptionTemplate",
								"path": ["Cloud Application", "DB Technologies", "Key/Value Store"],
								"name": "Key/Value Store",
								"self": "http://152.96.193.210:8080/element/Cloud+Application%2FDB+Technologies%2FKey%2F%2FValue+Store"
							}
						]
					},
					{
						"type": "ProblemOccurrence",
						"path": ["My Project", "Session State Management"],
						"name": "Session State Management",
						"self": "http://152.96.193.210:8080/element/My+Project%2FSession+State+Management",
						"attributes": {},
						"notes": "How to manage session state on servers?",
						"state": "Open",
						"alternatives": [
							{
								"type": "OptionOccurrence",
								"path": ["My Project", "Server Session State"],
								"name": "Server Session State",
								"self": "http://152.96.193.210:8080/element/My+Project%2FServer+Session+State"
							},
							{
								"type": "OptionOccurrence",
								"path": ["My Project", "DB Session State"],
								"name": "DB Session State",
								"self": "http://152.96.193.210:8080/element/My+Project%2FDB+Session+State"
							},
							{
								"type": "OptionOccurrence",
								"path": ["My Project", "Cloud Session State"],
								"name": "Cloud Session State",
								"self": "http://152.96.193.210:8080/element/My+Project%2FCloud+Session+State"
							}
						],
						"template": {
							"type": "ProblemTemplate",
							"path": ["Cloud Application", "Session Management", "Session State Management"],
							"name": "Session State Management",
							"self": "http://152.96.193.210:8080/element/Cloud+Application%2FSession+Management%2FSession+State+Management"
						}
					}
				]});

				var scope = rootScope.$new();
				var controller: app.application.MappingController = new app.application.MappingController(scope, location, http, persistenceService);
				httpBackend.flush();

				var dkSystem = new app.domain.model.dks.DecisionKnowledgeSystem("http://localhost:9940"); dkSystem.id = 1;
				expect(scope.currentDks).toEqual(dkSystem);

				expect(scope.problems.length).toEqual(1);
				expect(scope.problems[0].name).toEqual("DB Model");
				expect(scope.problems[0].alternatives.length).toEqual(2);
			})
		});
	}
}