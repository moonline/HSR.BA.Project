/// <reference path='../../../../public/test/includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/TaskPropertyRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/DecisionRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/MappingRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/DecisionKnowledgeSystemRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/ProblemRepository.ts' />

/// <reference path='../../../../app/assets/scripts/classes/application/MappingController.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/model/DecisionKnowledgeSystem.ts' />

module test {
	export module helper {

	}
}

module test {
	export function MappingControllerTest() {
		describe("Mapping controller class suite", function() {
			var http, httpBackend, rootScope, persistenceService;

			beforeEach(inject(function ($rootScope, $http, $httpBackend) {
				http = $http;
				httpBackend = $httpBackend;
				rootScope = $rootScope;

				persistenceService = {
					taskTemplateRepository: new core.TaskTemplateRepository($http),
					taskPropertyRepository: new core.TaskPropertyRepository($http),
					decisionRepository: new dks.DecisionRepository($http),
					mappingRepository: new core.MappingRepository($http),
					decisionKnowledgeRepository: new dks.DecisionKnowledgeSystemRepository($http),
					problemRepository: new dks.ProblemRepository($http)
				};
				persistenceService.decisionKnowledgeRepository.resources['all'] = '/dks/decisionKnowledgeSystem';
				persistenceService.taskTemplateRepository.resources['all'] = '/taskTemplate';
				persistenceService.taskPropertyRepository.resources['all'] = '/taskProperty';
				persistenceService.mappingRepository.resources['all'] = '/mapping';
			}));

			it("load problems and decisions from remote dks using dks sources", function() {
				// for this test taskTemplates and taskProperties are not relevant, so it works with an empty result
				httpBackend.when("GET", '/taskTemplate').respond({});
				httpBackend.when("GET", '/taskProperty').respond({});
				httpBackend.when("GET", '/mapping').respond({});


				httpBackend.when("GET", '/dks/decisionKnowledgeSystem').respond({
					"items": [
						{
							"id": 1,
							"address": "http://localhost:9940"
						}
					]
				});
				httpBackend.when("GET", '/dks/getFromDKS?url='+encodeURIComponent('http://localhost:9940/element')).respond({
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
				var controller: core.MappingController = new core.MappingController(scope, location, http, persistenceService);
				httpBackend.flush();

				var dkSystem = new dks.DecisionKnowledgeSystem("http://localhost:9940"); dkSystem.id = 1;
				expect(scope.currentDks).toEqual(dkSystem);

				expect(scope.problems.length).toEqual(1);
				expect(scope.problems[0].name).toEqual("DB Model");
				expect(scope.problems[0].options.length).toEqual(2);

				expect(scope.decisions.length).toEqual(1);
				expect(scope.decisions[0].name).toEqual("Session State Management");
				expect(scope.decisions[0].options.length).toEqual(3);
			})
		});
	}
}