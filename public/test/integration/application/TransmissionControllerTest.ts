/// <reference path='../../includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/repository/PPTAccountRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/RequestTemplateRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/ProjectRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/ProcessorRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/DecisionRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/OptionRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/MappingRepository.ts' />

/// <reference path='../../../../app/assets/scripts/classes/application/TransmissionController.ts' />

module test.integration.application {
	export function TransmissionControllerTest() {
		describe("Transmission controller class suite", function () {
			var http, httpBackend, rootScope, persistenceService, q;

			beforeEach(inject(function ($q, $rootScope, $http, $httpBackend) {
				q = $q;
				http = $http;
				httpBackend = $httpBackend;
				rootScope = $rootScope;

				// for this test most data is not relevant, so it works with an empty result
				httpBackend.when('GET', '/rest/api/1/requestTemplate').respond({
					"items": [{
						"id": 39,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"project": {"id": 2, "name": "Project"},
						"name": "Jira Request Template",
						"url": "/rest/api/2/issue",
						"requestBodyTemplate": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"${pptProject}\"\n\t\t},\n\t\t$!ifElse:(parentRequestData.key,\" \"parent\": {\n\t\t\t\"key\": \"$!{parentRequestData.key}\"\n\t\t}\\, \", \"\")$\n\t\t\"summary\": \"${taskTemplate.name}\",\n\t\t\"description\": \"${taskTemplate.attributes.Description}. \\nDecision: ${node.name}\\nDKS link: ${node.self}\\nAttributes:\\n$objectToString:(node.attributes, \": \", \"\\n\")$\",\n\t\t$ifElse:(taskTemplate.attributes.Due Date,\" \"duedate\": \"${taskTemplate.attributes.Due Date}\"\\, \", \"\")$\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"$!ifElse:(parentRequestData.key,\"Sub-task\", \"${taskTemplate.attributes.Type}\")$\"\n\t\t},\n\t\t$ifElse:(taskTemplate.attributes.Priority, \" \"priority\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Priority}\"\n\t\t}\\, \", \"\")$\n\t\t$mapExistingAssignees:(taskTemplate.attributes.Assignee, \"Project Planner:admin\\,Customer:admin\\,Architect:admin\",\" \"assignee\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Assignee}\"\n\t\t}\\, \")$\n\t\t$ifElse:(taskTemplate.attributes.Estimated Duration, \" \"timetracking\": {\n\t\t\t\"originalEstimate\": \"${taskTemplate.attributes.Estimated Duration}\"\n\t\t}\\, \", \"\")$\n\t\t\"labels\": [\"${node.attributes.Intellectual Property Rights}\", \"${node.attributes.Project Stage}\", \"createdByEEPPI\"]\n\t}\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/requestTemplate').respond({
					"items": [{
						"id": 39,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"project": {"id": 2, "name": "Project"},
						"name": "Jira Request Template",
						"url": "/rest/api/2/issue",
						"requestBodyTemplate": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"${pptProject}\"\n\t\t},\n\t\t$!ifElse:(parentRequestData.key,\" \"parent\": {\n\t\t\t\"key\": \"$!{parentRequestData.key}\"\n\t\t}\\, \", \"\")$\n\t\t\"summary\": \"${taskTemplate.name}\",\n\t\t\"description\": \"${taskTemplate.attributes.Description}. \\nDecision: ${node.name}\\nDKS link: ${node.self}\\nAttributes:\\n$objectToString:(node.attributes, \": \", \"\\n\")$\",\n\t\t$ifElse:(taskTemplate.attributes.Due Date,\" \"duedate\": \"${taskTemplate.attributes.Due Date}\"\\, \", \"\")$\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"$!ifElse:(parentRequestData.key,\"Sub-task\", \"${taskTemplate.attributes.Type}\")$\"\n\t\t},\n\t\t$ifElse:(taskTemplate.attributes.Priority, \" \"priority\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Priority}\"\n\t\t}\\, \", \"\")$\n\t\t$mapExistingAssignees:(taskTemplate.attributes.Assignee, \"Project Planner:admin\\,Customer:admin\\,Architect:admin\",\" \"assignee\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Assignee}\"\n\t\t}\\, \")$\n\t\t$ifElse:(taskTemplate.attributes.Estimated Duration, \" \"timetracking\": {\n\t\t\t\"originalEstimate\": \"${taskTemplate.attributes.Estimated Duration}\"\n\t\t}\\, \", \"\")$\n\t\t\"labels\": [\"${node.attributes.Intellectual Property Rights}\", \"${node.attributes.Project Stage}\", \"createdByEEPPI\"]\n\t}\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/user/pptAccount').respond({
					"items": [{
						"id": 5,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"pptUrl": "http://localhost:9920",
						"user": {"id": 4, "name": "demo"},
						"pptUsername": "admin"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/project').respond({"items": [{"id": 2, "name": "Project"}]});
				httpBackend.when('GET', '/rest/api/1/processor').respond({
					"items": [{
						"id": 40,
						"name": "objectToString",
						"project": {"id": 2, "name": "Project"},
						"code": "function(list, separator1, separator2) {\n\tvar separator1 = separator1 || \": \";\n\tvar separator2 = separator2 || \", \";\n\tvar text = \"\";\n\tvar keys = Object.keys(list);\n\tkeys.forEach(function(key, index){\n\t\ttext += key+separator1+list[key];\n\t\tif(index < keys.length-1) { text += separator2; }\n\t});\n\treturn text;\n}"
					}, {
						"id": 41,
						"name": "ifElse",
						"project": {"id": 2, "name": "Project"},
						"code": "function(condition, ifField, elseField) {\n\t\tif(condition && ifField) {\n\t\t\treturn ifField;\n\t\t} else {\n\t\t\treturn elseField;\n\t\t}\n}"
					}, {
						"id": 42,
						"name": "mapExistingAssignees",
						"project": {"id": 2, "name": "Project"},
						"code": "function(assignee, existingAssignees, assigneeJSON) {\n\t\tif(assignee && existingAssignees && assigneeJSON) {\n\t\t\tvar assigneeMappingList = existingAssignees.split(\",\");\n\t\t\tvar assigneeMapping = {};\n\t\t\tfor(var ami in assigneeMappingList) {\n\t\t\t\tvar assigneeName = assigneeMappingList[ami].split(\":\")[0].trim();\n\t\t\t\tassigneeMapping[assigneeName] = assigneeMappingList[ami].split(\":\")[1].trim();\n\t\t\t}\n\t\t\tif(assigneeMapping[assignee]) {\n\t\t\t\treturn assigneeJSON.replace(assignee, assigneeMapping[assignee]);\n\t\t\t} else {\n\t\t\t\treturn \"\";\n\t\t\t}\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n}"
					}, {
						"id": 43,
						"name": "taggedValue",
						"project": {"id": 2, "name": "Project"},
						"code": "function(values, name) {\n\t\treturn (values && name && values[name]) ? values[name] : \"\";\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks').respond({
					"items": [{
						"id": 3,
						"name": "DKS",
						"url": "http://localhost:9940"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks/getFromDKS?url=http%3A%2F%2Flocalhost%3A9940%2Felement%3Fquery%3Dtype%2520is%2520%2522ProblemOccurrence%2522').respond({
					"startAt": 0,
					"maxResults": 2147483647,
					"length": 3,
					"elements": [{
						"type": "ProblemOccurrence",
						"id": 19,
						"path": ["AVT", "Cloud Providers", "Service Model"],
						"name": "Service Model",
						"self": "http://localhost:9940/element/19",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "Which xaaS Service Model does the provider support/ and/or does the consumer use? The term service model is introduced in the NIST definition of cloud computing and has been adopted widely by book authors, vendors and consultants.\r\n\r\nSee CCP website for more information (direct link: http://www.cloudcomputingpatterns.org/Category:Cloud_Service_Models).",
						"state": "PartiallySolved",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 17,
							"path": ["AVT", "Cloud Providers", "IaaS"],
							"name": "IaaS",
							"self": "http://localhost:9940/element/17"
						}, {
							"type": "OptionOccurrence",
							"id": 18,
							"path": ["AVT", "Cloud Providers", "PaaS"],
							"name": "PaaS",
							"self": "http://localhost:9940/element/18"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 10,
							"path": ["Cloud Application", "Cloud Providers", "Service Model"],
							"name": "Service Model",
							"self": "http://localhost:9940/element/10"
						}
					}, {
						"type": "ProblemOccurrence",
						"id": 16,
						"path": ["AVT", "DB Model"],
						"name": "DB Model",
						"self": "http://localhost:9940/element/16",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "",
						"state": "Open",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 15,
							"path": ["AVT", "Key/Value Store"],
							"name": "Key/Value Store",
							"self": "http://localhost:9940/element/15"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 6,
							"path": ["Cloud Application", "DB Technologies", "DB Model"],
							"name": "DB Model",
							"self": "http://localhost:9940/element/6"
						}
					}, {
						"type": "ProblemOccurrence",
						"id": 14,
						"path": ["AVT", "Session State Management"],
						"name": "Session State Management",
						"self": "http://localhost:9940/element/14",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "How to manage session state on servers?",
						"state": "PartiallySolved",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 11,
							"path": ["AVT", "Server Session State"],
							"name": "Server Session State",
							"self": "http://localhost:9940/element/11"
						}, {
							"type": "OptionOccurrence",
							"id": 13,
							"path": ["AVT", "Cloud Session State"],
							"name": "Cloud Session State",
							"self": "http://localhost:9940/element/13"
						}, {
							"type": "OptionOccurrence",
							"id": 12,
							"path": ["AVT", "DB Session State"],
							"name": "DB Session State",
							"self": "http://localhost:9940/element/12"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 3,
							"path": ["Cloud Application", "Session Management", "Session State Management"],
							"name": "Session State Management",
							"self": "http://localhost:9940/element/3"
						}
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks/getFromDKS?url=http%3A%2F%2Flocalhost%3A9940%2Felement%3Fquery%3Dtype%2520is%2520%2522OptionOccurrence%2522').respond({
					"startAt": 0,
					"maxResults": 2147483647,
					"length": 6,
					"elements": [{
						"type": "OptionOccurrence",
						"id": 17,
						"path": ["AVT", "Cloud Providers", "IaaS"],
						"name": "IaaS",
						"self": "http://localhost:9940/element/17",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "http://www.cloudcomputingpatterns.org/Infrastructure_as_a_Service_(IaaS)",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 7,
							"path": ["Cloud Application", "Cloud Providers", "IaaS"],
							"name": "IaaS",
							"self": "http://localhost:9940/element/7"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 18,
						"path": ["AVT", "Cloud Providers", "PaaS"],
						"name": "PaaS",
						"self": "http://localhost:9940/element/18",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "http://www.cloudcomputingpatterns.org/Platform_as_a_Service_(PaaS)\r\n\r\nNote that the boundary between IaaS and Paas is somewhat blurred. e.g. does the operating system belong to the PaaS model, or is it still IaaS? Literature does not agree here; CCP sticks to NIST point of view, which sees operating system as PaaS (is this practical?)",
						"state": "Neglected",
						"template": {
							"type": "OptionTemplate",
							"id": 8,
							"path": ["Cloud Application", "Cloud Providers", "PaaS"],
							"name": "PaaS",
							"self": "http://localhost:9940/element/8"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 13,
						"path": ["AVT", "Cloud Session State"],
						"name": "Cloud Session State",
						"self": "http://localhost:9940/element/13",
						"attributes": {"Intellectual Property Rights": "Confidential"},
						"notes": "Store session state on ultra secret cloud service",
						"state": "Neglected",
						"template": null
					}, {
						"type": "OptionOccurrence",
						"id": 12,
						"path": ["AVT", "DB Session State"],
						"name": "DB Session State",
						"self": "http://localhost:9940/element/12",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "Persist session state on remote DB",
						"state": "Chosen",
						"template": {
							"type": "OptionTemplate",
							"id": 2,
							"path": ["Cloud Application", "Session Management", "DB Session State"],
							"name": "DB Session State",
							"self": "http://localhost:9940/element/2"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 15,
						"path": ["AVT", "Key/Value Store"],
						"name": "Key/Value Store",
						"self": "http://localhost:9940/element/15",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 5,
							"path": ["Cloud Application", "DB Technologies", "Key/Value Store"],
							"name": "Key/Value Store",
							"self": "http://localhost:9940/element/5"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 11,
						"path": ["AVT", "Server Session State"],
						"name": "Server Session State",
						"self": "http://localhost:9940/element/11",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "Keep session state on web server\r\n\r\n# Pros\r\n\r\n* ...\r\n* ...",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 1,
							"path": ["Cloud Application", "Session Management", "Server Session State"],
							"name": "Server Session State",
							"self": "http://localhost:9940/element/1"
						}
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dksMapping').respond({
					"items": [{
						"id": 19,
						"taskTemplate": {
							"id": 12,
							"properties": [{
								"id": 13,
								"property": {"id": 6, "name": "Assignee"},
								"value": "Project Planner"
							}, {"id": 14, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
								"id": 15,
								"property": {"id": 8, "name": "Description"},
								"value": "Define criterions for evaluation"
							}, {"id": 16, "property": {"id": 9, "name": "Priority"}, "value": "Major"}, {
								"id": 17,
								"property": {"id": 10, "name": "Due Date"},
								"value": "2015-01-14"
							}, {"id": 18, "property": {"id": 11, "name": "Estimated Duration"}, "value": "10h"}],
							"parent": null,
							"name": "Define criterions"
						},
						"dksNode": "3"
					}, {
						"id": 29,
						"taskTemplate": {
							"id": 26,
							"properties": [{
								"id": 27,
								"property": {"id": 6, "name": "Assignee"},
								"value": "Customer"
							}, {"id": 28, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
							"parent": null,
							"name": "Rank criterions"
						},
						"dksNode": "3"
					}, {
						"id": 30,
						"taskTemplate": {
							"id": 26,
							"properties": [{
								"id": 27,
								"property": {"id": 6, "name": "Assignee"},
								"value": "Customer"
							}, {"id": 28, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
							"parent": null,
							"name": "Rank criterions"
						},
						"dksNode": "6"
					}, {
						"id": 35,
						"taskTemplate": {
							"id": 31,
							"properties": [{
								"id": 32,
								"property": {"id": 6, "name": "Assignee"},
								"value": "Project Planner"
							}, {"id": 33, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
								"id": 34,
								"property": {"id": 8, "name": "Description"},
								"value": "Rank every item for every criterion."
							}],
							"parent": null,
							"name": "Define criterion values"
						},
						"dksNode": "3"
					}, {
						"id": 2250,
						"taskTemplate": {
							"id": 31,
							"properties": [{
								"id": 32,
								"property": {"id": 6, "name": "Assignee"},
								"value": "Project Planner"
							}, {"id": 33, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
								"id": 34,
								"property": {"id": 8, "name": "Description"},
								"value": "Rank every item for every criterion."
							}],
							"parent": null,
							"name": "Define criterion values"
						},
						"dksNode": "5"
					}, {
						"id": 2251,
						"taskTemplate": {
							"id": 12,
							"properties": [{
								"id": 13,
								"property": {"id": 6, "name": "Assignee"},
								"value": "Project Planner"
							}, {"id": 14, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
								"id": 15,
								"property": {"id": 8, "name": "Description"},
								"value": "Define criterions for evaluation"
							}, {"id": 16, "property": {"id": 9, "name": "Priority"}, "value": "Major"}, {
								"id": 17,
								"property": {"id": 10, "name": "Due Date"},
								"value": "2015-01-14"
							}, {"id": 18, "property": {"id": 11, "name": "Estimated Duration"}, "value": "10h"}],
							"parent": null,
							"name": "Define criterions"
						},
						"dksNode": "5"
					}, {
						"id": 2254,
						"taskTemplate": {
							"id": 36,
							"properties": [{"id": 37, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
							"parent": null,
							"name": "Hold decision meeting"
						},
						"dksNode": "6"
					}, {
						"id": 2255,
						"taskTemplate": {
							"id": 38,
							"properties": [],
							"parent": {
								"id": 36,
								"properties": [{"id": 37, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
								"parent": null,
								"name": "Hold decision meeting"
							},
							"name": "Invite to decision meeting"
						},
						"dksNode": "6"
					}]
				});

				persistenceService = {
					pptAccountRepository: new app.domain.repository.ppt.PPTAccountRepository($http),
					requestTemplateRepository: new app.domain.repository.ppt.RequestTemplateRepository($http),
					projectRepository: new app.domain.repository.core.ProjectRepository($http),
					processorRepository: new app.domain.repository.core.ProcessorRepository($http),
					taskPropertyRepository: new app.domain.repository.core.TaskTemplateRepository($http),
					decisionKnowledgeSystemRepository: new app.domain.repository.dks.DecisionKnowledgeSystemRepository($http),
					projectPlanningToolRepository: new app.domain.repository.ppt.ProjectPlanningToolRepository($http),
					mappingRepository: new app.domain.repository.core.MappingRepository($http),
					optionRepository: new app.domain.repository.dks.OptionRepository($http),
					decisionRepository: new app.domain.repository.dks.DecisionRepository($http)
				};
			}));

			it("can list all mapping information", function () {
				var scope = rootScope.$new();
				new app.application.TransmissionController(scope, location, persistenceService, null, http);
				httpBackend.flush();
				expect(scope.allMappingInformation.length).toBe(8);
			});

			var getAuthenticationServiceWithLoggedInUser = function () {
				httpBackend.when('POST', '/rest/api/1/user/login').respond({"id": 4, "name": "name"});
				httpBackend.when('GET', '/rest/api/1/user/loginStatus').respond({"id": 4, "name": "name"});
				var authenticationService = new app.service.AuthenticationService(http, q);
				authenticationService.login("name", "pw", function () {
				});
				return authenticationService;
			};

			it("can transform mapping information", function () {
				var scope = rootScope.$new();
				new app.application.TransmissionController(scope, location, persistenceService, getAuthenticationServiceWithLoggedInUser(), http);
				httpBackend.flush();
				scope.processTaskTemplates();
				expect(scope.exportRequests.length).toBe(7); //it has 7 parent requests
				expect(scope.exportRequests[1].subRequests.length).toBe(1); //it has a second request with a child request
			});

			it("performs the correct requests", function () {
				var scope = rootScope.$new();
				new app.application.TransmissionController(scope, location, persistenceService, getAuthenticationServiceWithLoggedInUser(), http);
				httpBackend.flush();
				scope.setPPTProject("TEST");
				scope.processTaskTemplates();
				scope.transmit();
				httpBackend.expectPOST('/rest/api/1/ppt/createPPTTask', {
					"account": {
						"pptPassword": null,
						"id": 5,
						"user": {"userName": "demo", "id": 4},
						"pptUrl": "http://localhost:9920",
						"pptUsername": "admin",
						"ppt": {"id": 1, "name": "Project Planning Tool"}
					},
					"path": "/rest/api/2/issue",
					"content": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\n\t\t\"summary\": \"Rank criterions\",\n\t\t\"description\": \". \\nDecision: DB Model\\nDKS link: http://localhost:9940/element/16\\nAttributes:\\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n\t\t\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n\t\t\n\t\t \"assignee\": {\n\t\t\t\"name\": \"admin\"\n\t\t}, \n\t\t\n\t\t\"labels\": [\"Unrestricted\", \"Inception\", \"createdByEEPPI\"]\n\t}\n}",
					"taskTemplate": {
						"id": 26,
						"name": "Rank criterions",
						"properties": [{
							"id": 27,
							"property": {"id": 6, "name": "Assignee"},
							"value": "Customer"
						}, {"id": 28, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
						"parent": null,
						"attributes": {"Assignee": "Customer", "Type": "Task"}
					},
					"taskProperties": [{
						"id": 27,
						"property": {"id": 6, "name": "Assignee"},
						"value": "Customer"
					}, {"id": 28, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
					"project": {"id": 2, "name": "Project"}
				}).respond({});
				httpBackend.expectPOST('/rest/api/1/ppt/createPPTTask', {
					"account": {
						"pptPassword": null,
						"id": 5,
						"user": {"userName": "demo", "id": 4},
						"pptUrl": "http://localhost:9920",
						"pptUsername": "admin",
						"ppt": {"id": 1, "name": "Project Planning Tool"}
					},
					"path": "/rest/api/2/issue",
					"content": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\n\t\t\"summary\": \"Hold decision meeting\",\n\t\t\"description\": \". \\nDecision: DB Model\\nDKS link: http://localhost:9940/element/16\\nAttributes:\\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n\t\t\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n\t\t\n\t\t\n\t\t\n\t\t\"labels\": [\"Unrestricted\", \"Inception\", \"createdByEEPPI\"]\n\t}\n}",
					"taskTemplate": {
						"id": 36,
						"name": "Hold decision meeting",
						"properties": [{"id": 37, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
						"parent": null,
						"attributes": {"Type": "Task"}
					},
					"taskProperties": [{"id": 37, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
					"project": {"id": 2, "name": "Project"}
				}).respond({"id": "10001", "key": "TEST-2", "self": "http://localhost:9920/rest/api/2/issue/10001"});
				httpBackend.expectPOST('/rest/api/1/ppt/createPPTTask', {
					"account": {
						"pptPassword": null,
						"id": 5,
						"user": {"userName": "demo", "id": 4},
						"pptUrl": "http://localhost:9920",
						"pptUsername": "admin",
						"ppt": {"id": 1, "name": "Project Planning Tool"}
					},
					"path": "/rest/api/2/issue",
					"content": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t \"parent\": {\n\t\t\t\"key\": \"TEST-2\"\n\t\t}, \n\t\t\"summary\": \"Invite to decision meeting\",\n\t\t\"description\": \". \\nDecision: DB Model\\nDKS link: http://localhost:9940/element/16\\nAttributes:\\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n\t\t\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"Sub-task\"\n\t\t},\n\t\t\n\t\t\n\t\t\n\t\t\"labels\": [\"Unrestricted\", \"Inception\", \"createdByEEPPI\"]\n\t}\n}",
					"taskTemplate": {
						"id": 38,
						"name": "Invite to decision meeting",
						"properties": [],
						"parent": {
							"id": 36,
							"properties": [{"id": 37, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
							"parent": null,
							"name": "Hold decision meeting"
						},
						"attributes": {}
					},
					"taskProperties": [],
					"project": {"id": 2, "name": "Project"}
				}).respond({});
				httpBackend.expectPOST('/rest/api/1/ppt/createPPTTask', {
					"account": {
						"pptPassword": null,
						"id": 5,
						"user": {"userName": "demo", "id": 4},
						"pptUrl": "http://localhost:9920",
						"pptUsername": "admin",
						"ppt": {"id": 1, "name": "Project Planning Tool"}
					},
					"path": "/rest/api/2/issue",
					"content": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\n\t\t\"summary\": \"Define criterions\",\n\t\t\"description\": \"Define criterions for evaluation. \\nDecision: Key/Value Store\\nDKS link: http://localhost:9940/element/15\\nAttributes:\\nIntellectual Property Rights: Unrestricted\",\n\t\t \"duedate\": \"2015-01-14\", \n\t\t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n\t\t \"priority\": {\n\t\t\t\"name\": \"Major\"\n\t\t}, \n\t\t \"assignee\": {\n\t\t\t\"name\": \"admin\"\n\t\t}, \n\t\t \"timetracking\": {\n\t\t\t\"originalEstimate\": \"10h\"\n\t\t}, \n\t\t\"labels\": [\"Unrestricted\", \"\", \"createdByEEPPI\"]\n\t}\n}",
					"taskTemplate": {
						"id": 12,
						"name": "Define criterions",
						"properties": [{
							"id": 13,
							"property": {"id": 6, "name": "Assignee"},
							"value": "Project Planner"
						}, {"id": 14, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
							"id": 15,
							"property": {"id": 8, "name": "Description"},
							"value": "Define criterions for evaluation"
						}, {"id": 16, "property": {"id": 9, "name": "Priority"}, "value": "Major"}, {
							"id": 17,
							"property": {"id": 10, "name": "Due Date"},
							"value": "2015-01-14"
						}, {"id": 18, "property": {"id": 11, "name": "Estimated Duration"}, "value": "10h"}],
						"parent": null,
						"attributes": {
							"Assignee": "Project Planner",
							"Type": "Task",
							"Description": "Define criterions for evaluation",
							"Priority": "Major",
							"Due Date": "2015-01-14",
							"Estimated Duration": "10h"
						}
					},
					"taskProperties": [{
						"id": 13,
						"property": {"id": 6, "name": "Assignee"},
						"value": "Project Planner"
					}, {"id": 14, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
						"id": 15,
						"property": {"id": 8, "name": "Description"},
						"value": "Define criterions for evaluation"
					}, {"id": 16, "property": {"id": 9, "name": "Priority"}, "value": "Major"}, {
						"id": 17,
						"property": {"id": 10, "name": "Due Date"},
						"value": "2015-01-14"
					}, {"id": 18, "property": {"id": 11, "name": "Estimated Duration"}, "value": "10h"}],
					"project": {"id": 2, "name": "Project"}
				}).respond({});
				httpBackend.expectPOST('/rest/api/1/ppt/createPPTTask', {
					"account": {
						"pptPassword": null,
						"id": 5,
						"user": {"userName": "demo", "id": 4},
						"pptUrl": "http://localhost:9920",
						"pptUsername": "admin",
						"ppt": {"id": 1, "name": "Project Planning Tool"}
					},
					"path": "/rest/api/2/issue",
					"content": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\n\t\t\"summary\": \"Define criterion values\",\n\t\t\"description\": \"Rank every item for every criterion.. \\nDecision: Key/Value Store\\nDKS link: http://localhost:9940/element/15\\nAttributes:\\nIntellectual Property Rights: Unrestricted\",\n\t\t\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n\t\t\n\t\t \"assignee\": {\n\t\t\t\"name\": \"admin\"\n\t\t}, \n\t\t\n\t\t\"labels\": [\"Unrestricted\", \"\", \"createdByEEPPI\"]\n\t}\n}",
					"taskTemplate": {
						"id": 31,
						"name": "Define criterion values",
						"properties": [{
							"id": 32,
							"property": {"id": 6, "name": "Assignee"},
							"value": "Project Planner"
						}, {"id": 33, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
							"id": 34,
							"property": {"id": 8, "name": "Description"},
							"value": "Rank every item for every criterion."
						}],
						"parent": null,
						"attributes": {
							"Assignee": "Project Planner",
							"Type": "Task",
							"Description": "Rank every item for every criterion."
						}
					},
					"taskProperties": [{
						"id": 32,
						"property": {"id": 6, "name": "Assignee"},
						"value": "Project Planner"
					}, {"id": 33, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
						"id": 34,
						"property": {"id": 8, "name": "Description"},
						"value": "Rank every item for every criterion."
					}],
					"project": {"id": 2, "name": "Project"}
				}).respond({});
				httpBackend.expectPOST('/rest/api/1/ppt/createPPTTask', {
					"account": {
						"pptPassword": null,
						"id": 5,
						"user": {"userName": "demo", "id": 4},
						"pptUrl": "http://localhost:9920",
						"pptUsername": "admin",
						"ppt": {"id": 1, "name": "Project Planning Tool"}
					},
					"path": "/rest/api/2/issue",
					"content": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\n\t\t\"summary\": \"Define criterions\",\n\t\t\"description\": \"Define criterions for evaluation. \\nDecision: Session State Management\\nDKS link: http://localhost:9940/element/14\\nAttributes:\\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n\t\t \"duedate\": \"2015-01-14\", \n\t\t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n\t\t \"priority\": {\n\t\t\t\"name\": \"Major\"\n\t\t}, \n\t\t \"assignee\": {\n\t\t\t\"name\": \"admin\"\n\t\t}, \n\t\t \"timetracking\": {\n\t\t\t\"originalEstimate\": \"10h\"\n\t\t}, \n\t\t\"labels\": [\"Unrestricted\", \"Inception\", \"createdByEEPPI\"]\n\t}\n}",
					"taskTemplate": {
						"id": 12,
						"name": "Define criterions",
						"properties": [{
							"id": 13,
							"property": {"id": 6, "name": "Assignee"},
							"value": "Project Planner"
						}, {"id": 14, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
							"id": 15,
							"property": {"id": 8, "name": "Description"},
							"value": "Define criterions for evaluation"
						}, {"id": 16, "property": {"id": 9, "name": "Priority"}, "value": "Major"}, {
							"id": 17,
							"property": {"id": 10, "name": "Due Date"},
							"value": "2015-01-14"
						}, {"id": 18, "property": {"id": 11, "name": "Estimated Duration"}, "value": "10h"}],
						"parent": null,
						"attributes": {
							"Assignee": "Project Planner",
							"Type": "Task",
							"Description": "Define criterions for evaluation",
							"Priority": "Major",
							"Due Date": "2015-01-14",
							"Estimated Duration": "10h"
						}
					},
					"taskProperties": [{
						"id": 13,
						"property": {"id": 6, "name": "Assignee"},
						"value": "Project Planner"
					}, {"id": 14, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
						"id": 15,
						"property": {"id": 8, "name": "Description"},
						"value": "Define criterions for evaluation"
					}, {"id": 16, "property": {"id": 9, "name": "Priority"}, "value": "Major"}, {
						"id": 17,
						"property": {"id": 10, "name": "Due Date"},
						"value": "2015-01-14"
					}, {"id": 18, "property": {"id": 11, "name": "Estimated Duration"}, "value": "10h"}],
					"project": {"id": 2, "name": "Project"}
				}).respond({});
				httpBackend.expectPOST('/rest/api/1/ppt/createPPTTask', {
					"account": {
						"pptPassword": null,
						"id": 5,
						"user": {"userName": "demo", "id": 4},
						"pptUrl": "http://localhost:9920",
						"pptUsername": "admin",
						"ppt": {"id": 1, "name": "Project Planning Tool"}
					},
					"path": "/rest/api/2/issue",
					"content": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\n\t\t\"summary\": \"Rank criterions\",\n\t\t\"description\": \". \\nDecision: Session State Management\\nDKS link: http://localhost:9940/element/14\\nAttributes:\\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n\t\t\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n\t\t\n\t\t \"assignee\": {\n\t\t\t\"name\": \"admin\"\n\t\t}, \n\t\t\n\t\t\"labels\": [\"Unrestricted\", \"Inception\", \"createdByEEPPI\"]\n\t}\n}",
					"taskTemplate": {
						"id": 26,
						"name": "Rank criterions",
						"properties": [{
							"id": 27,
							"property": {"id": 6, "name": "Assignee"},
							"value": "Customer"
						}, {"id": 28, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
						"parent": null,
						"attributes": {"Assignee": "Customer", "Type": "Task"}
					},
					"taskProperties": [{
						"id": 27,
						"property": {"id": 6, "name": "Assignee"},
						"value": "Customer"
					}, {"id": 28, "property": {"id": 7, "name": "Type"}, "value": "Task"}],
					"project": {"id": 2, "name": "Project"}
				}).respond({});
				httpBackend.expectPOST('/rest/api/1/ppt/createPPTTask', {
					"account": {
						"pptPassword": null,
						"id": 5,
						"user": {"userName": "demo", "id": 4},
						"pptUrl": "http://localhost:9920",
						"pptUsername": "admin",
						"ppt": {"id": 1, "name": "Project Planning Tool"}
					},
					"path": "/rest/api/2/issue",
					"content": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\n\t\t\"summary\": \"Define criterion values\",\n\t\t\"description\": \"Rank every item for every criterion.. \\nDecision: Session State Management\\nDKS link: http://localhost:9940/element/14\\nAttributes:\\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n\t\t\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n\t\t\n\t\t \"assignee\": {\n\t\t\t\"name\": \"admin\"\n\t\t}, \n\t\t\n\t\t\"labels\": [\"Unrestricted\", \"Inception\", \"createdByEEPPI\"]\n\t}\n}",
					"taskTemplate": {
						"id": 31,
						"name": "Define criterion values",
						"properties": [{
							"id": 32,
							"property": {"id": 6, "name": "Assignee"},
							"value": "Project Planner"
						}, {"id": 33, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
							"id": 34,
							"property": {"id": 8, "name": "Description"},
							"value": "Rank every item for every criterion."
						}],
						"parent": null,
						"attributes": {
							"Assignee": "Project Planner",
							"Type": "Task",
							"Description": "Rank every item for every criterion."
						}
					},
					"taskProperties": [{
						"id": 32,
						"property": {"id": 6, "name": "Assignee"},
						"value": "Project Planner"
					}, {"id": 33, "property": {"id": 7, "name": "Type"}, "value": "Task"}, {
						"id": 34,
						"property": {"id": 8, "name": "Description"},
						"value": "Rank every item for every criterion."
					}],
					"project": {"id": 2, "name": "Project"}
				}).respond({});
				httpBackend.flush();
				expect("done").toBe("done"); //expectPOST() did run successfully
			});

		});

		describe("Mapping and Parents Generation", function () {
			var http, httpBackend, rootScope, persistenceService, q;

			beforeEach(inject(function ($q, $rootScope, $http, $httpBackend) {
				q = $q;
				http = $http;
				httpBackend = $httpBackend;
				rootScope = $rootScope;

				// for this test most data is not relevant, so it works with an empty result
				httpBackend.when('GET', '/rest/api/1/requestTemplate').respond({
					"items": [{
						"id": 39,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"project": {"id": 2, "name": "Project"},
						"name": "Jira Request Template",
						"url": "/rest/api/2/issue",
						"requestBodyTemplate": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"${pptProject}\"\n\t\t},\n\t\t$!ifElse:(parentRequestData.key,\" \"parent\": {\n\t\t\t\"key\": \"$!{parentRequestData.key}\"\n\t\t}\\, \", \"\")$\n\t\t\"summary\": \"${taskTemplate.name}\",\n\t\t\"description\": \"${taskTemplate.attributes.Description}. \\nDecision: ${node.name}\\nDKS link: ${node.self}\\nAttributes:\\n$objectToString:(node.attributes, \": \", \"\\n\")$\",\n\t\t$ifElse:(taskTemplate.attributes.Due Date,\" \"duedate\": \"${taskTemplate.attributes.Due Date}\"\\, \", \"\")$\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"$!ifElse:(parentRequestData.key,\"Sub-task\", \"${taskTemplate.attributes.Type}\")$\"\n\t\t},\n\t\t$ifElse:(taskTemplate.attributes.Priority, \" \"priority\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Priority}\"\n\t\t}\\, \", \"\")$\n\t\t$mapExistingAssignees:(taskTemplate.attributes.Assignee, \"Project Planner:admin\\,Customer:admin\\,Architect:admin\",\" \"assignee\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Assignee}\"\n\t\t}\\, \")$\n\t\t$ifElse:(taskTemplate.attributes.Estimated Duration, \" \"timetracking\": {\n\t\t\t\"originalEstimate\": \"${taskTemplate.attributes.Estimated Duration}\"\n\t\t}\\, \", \"\")$\n\t\t\"labels\": [\"${node.attributes.Intellectual Property Rights}\", \"${node.attributes.Project Stage}\", \"createdByEEPPI\"]\n\t}\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/requestTemplate').respond({
					"items": [{
						"id": 39,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"project": {"id": 2, "name": "Project"},
						"name": "Jira Request Template",
						"url": "/rest/api/2/issue",
						"requestBodyTemplate": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"${pptProject}\"\n\t\t},\n\t\t$!ifElse:(parentRequestData.key,\" \"parent\": {\n\t\t\t\"key\": \"$!{parentRequestData.key}\"\n\t\t}\\, \", \"\")$\n\t\t\"summary\": \"${taskTemplate.name}\",\n\t\t\"description\": \"${taskTemplate.attributes.Description}. \\nDecision: ${node.name}\\nDKS link: ${node.self}\\nAttributes:\\n$objectToString:(node.attributes, \": \", \"\\n\")$\",\n\t\t$ifElse:(taskTemplate.attributes.Due Date,\" \"duedate\": \"${taskTemplate.attributes.Due Date}\"\\, \", \"\")$\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"$!ifElse:(parentRequestData.key,\"Sub-task\", \"${taskTemplate.attributes.Type}\")$\"\n\t\t},\n\t\t$ifElse:(taskTemplate.attributes.Priority, \" \"priority\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Priority}\"\n\t\t}\\, \", \"\")$\n\t\t$mapExistingAssignees:(taskTemplate.attributes.Assignee, \"Project Planner:admin\\,Customer:admin\\,Architect:admin\",\" \"assignee\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Assignee}\"\n\t\t}\\, \")$\n\t\t$ifElse:(taskTemplate.attributes.Estimated Duration, \" \"timetracking\": {\n\t\t\t\"originalEstimate\": \"${taskTemplate.attributes.Estimated Duration}\"\n\t\t}\\, \", \"\")$\n\t\t\"labels\": [\"${node.attributes.Intellectual Property Rights}\", \"${node.attributes.Project Stage}\", \"createdByEEPPI\"]\n\t}\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/user/pptAccount').respond({
					"items": [{
						"id": 5,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"pptUrl": "http://localhost:9920",
						"user": {"id": 4, "name": "demo"},
						"pptUsername": "admin"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/project').respond({"items": [{"id": 2, "name": "Project"}]});
				httpBackend.when('GET', '/rest/api/1/processor').respond({
					"items": [{
						"id": 40,
						"name": "objectToString",
						"project": {"id": 2, "name": "Project"},
						"code": "function(list, separator1, separator2) {\n\tvar separator1 = separator1 || \": \";\n\tvar separator2 = separator2 || \", \";\n\tvar text = \"\";\n\tvar keys = Object.keys(list);\n\tkeys.forEach(function(key, index){\n\t\ttext += key+separator1+list[key];\n\t\tif(index < keys.length-1) { text += separator2; }\n\t});\n\treturn text;\n}"
					}, {
						"id": 41,
						"name": "ifElse",
						"project": {"id": 2, "name": "Project"},
						"code": "function(condition, ifField, elseField) {\n\t\tif(condition && ifField) {\n\t\t\treturn ifField;\n\t\t} else {\n\t\t\treturn elseField;\n\t\t}\n}"
					}, {
						"id": 42,
						"name": "mapExistingAssignees",
						"project": {"id": 2, "name": "Project"},
						"code": "function(assignee, existingAssignees, assigneeJSON) {\n\t\tif(assignee && existingAssignees && assigneeJSON) {\n\t\t\tvar assigneeMappingList = existingAssignees.split(\",\");\n\t\t\tvar assigneeMapping = {};\n\t\t\tfor(var ami in assigneeMappingList) {\n\t\t\t\tvar assigneeName = assigneeMappingList[ami].split(\":\")[0].trim();\n\t\t\t\tassigneeMapping[assigneeName] = assigneeMappingList[ami].split(\":\")[1].trim();\n\t\t\t}\n\t\t\tif(assigneeMapping[assignee]) {\n\t\t\t\treturn assigneeJSON.replace(assignee, assigneeMapping[assignee]);\n\t\t\t} else {\n\t\t\t\treturn \"\";\n\t\t\t}\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n}"
					}, {
						"id": 43,
						"name": "taggedValue",
						"project": {"id": 2, "name": "Project"},
						"code": "function(values, name) {\n\t\treturn (values && name && values[name]) ? values[name] : \"\";\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks').respond({
					"items": [{
						"id": 3,
						"name": "DKS",
						"url": "http://localhost:9940"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks/getFromDKS?url=http%3A%2F%2Flocalhost%3A9940%2Felement%3Fquery%3Dtype%2520is%2520%2522ProblemOccurrence%2522').respond({
					"startAt": 0,
					"maxResults": 2147483647,
					"length": 3,
					"elements": [{
						"type": "ProblemOccurrence",
						"id": 19,
						"path": ["AVT", "Cloud Providers", "Service Model"],
						"name": "Service Model",
						"self": "http://localhost:9940/element/19",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "Which xaaS Service Model does the provider support/ and/or does the consumer use? The term service model is introduced in the NIST definition of cloud computing and has been adopted widely by book authors, vendors and consultants.\r\n\r\nSee CCP website for more information (direct link: http://www.cloudcomputingpatterns.org/Category:Cloud_Service_Models).",
						"state": "PartiallySolved",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 17,
							"path": ["AVT", "Cloud Providers", "IaaS"],
							"name": "IaaS",
							"self": "http://localhost:9940/element/17"
						}, {
							"type": "OptionOccurrence",
							"id": 18,
							"path": ["AVT", "Cloud Providers", "PaaS"],
							"name": "PaaS",
							"self": "http://localhost:9940/element/18"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 10,
							"path": ["Cloud Application", "Cloud Providers", "Service Model"],
							"name": "Service Model",
							"self": "http://localhost:9940/element/10"
						}
					}, {
						"type": "ProblemOccurrence",
						"id": 16,
						"path": ["AVT", "DB Model"],
						"name": "DB Model",
						"self": "http://localhost:9940/element/16",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "",
						"state": "Open",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 15,
							"path": ["AVT", "Key/Value Store"],
							"name": "Key/Value Store",
							"self": "http://localhost:9940/element/15"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 6,
							"path": ["Cloud Application", "DB Technologies", "DB Model"],
							"name": "DB Model",
							"self": "http://localhost:9940/element/6"
						}
					}, {
						"type": "ProblemOccurrence",
						"id": 14,
						"path": ["AVT", "Session State Management"],
						"name": "Session State Management",
						"self": "http://localhost:9940/element/14",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "How to manage session state on servers?",
						"state": "PartiallySolved",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 11,
							"path": ["AVT", "Server Session State"],
							"name": "Server Session State",
							"self": "http://localhost:9940/element/11"
						}, {
							"type": "OptionOccurrence",
							"id": 13,
							"path": ["AVT", "Cloud Session State"],
							"name": "Cloud Session State",
							"self": "http://localhost:9940/element/13"
						}, {
							"type": "OptionOccurrence",
							"id": 12,
							"path": ["AVT", "DB Session State"],
							"name": "DB Session State",
							"self": "http://localhost:9940/element/12"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 3,
							"path": ["Cloud Application", "Session Management", "Session State Management"],
							"name": "Session State Management",
							"self": "http://localhost:9940/element/3"
						}
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks/getFromDKS?url=http%3A%2F%2Flocalhost%3A9940%2Felement%3Fquery%3Dtype%2520is%2520%2522OptionOccurrence%2522').respond({
					"startAt": 0,
					"maxResults": 2147483647,
					"length": 6,
					"elements": [{
						"type": "OptionOccurrence",
						"id": 17,
						"path": ["AVT", "Cloud Providers", "IaaS"],
						"name": "IaaS",
						"self": "http://localhost:9940/element/17",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "http://www.cloudcomputingpatterns.org/Infrastructure_as_a_Service_(IaaS)",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 7,
							"path": ["Cloud Application", "Cloud Providers", "IaaS"],
							"name": "IaaS",
							"self": "http://localhost:9940/element/7"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 18,
						"path": ["AVT", "Cloud Providers", "PaaS"],
						"name": "PaaS",
						"self": "http://localhost:9940/element/18",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "http://www.cloudcomputingpatterns.org/Platform_as_a_Service_(PaaS)\r\n\r\nNote that the boundary between IaaS and Paas is somewhat blurred. e.g. does the operating system belong to the PaaS model, or is it still IaaS? Literature does not agree here; CCP sticks to NIST point of view, which sees operating system as PaaS (is this practical?)",
						"state": "Neglected",
						"template": {
							"type": "OptionTemplate",
							"id": 8,
							"path": ["Cloud Application", "Cloud Providers", "PaaS"],
							"name": "PaaS",
							"self": "http://localhost:9940/element/8"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 13,
						"path": ["AVT", "Cloud Session State"],
						"name": "Cloud Session State",
						"self": "http://localhost:9940/element/13",
						"attributes": {"Intellectual Property Rights": "Confidential"},
						"notes": "Store session state on ultra secret cloud service",
						"state": "Neglected",
						"template": null
					}, {
						"type": "OptionOccurrence",
						"id": 12,
						"path": ["AVT", "DB Session State"],
						"name": "DB Session State",
						"self": "http://localhost:9940/element/12",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "Persist session state on remote DB",
						"state": "Chosen",
						"template": {
							"type": "OptionTemplate",
							"id": 2,
							"path": ["Cloud Application", "Session Management", "DB Session State"],
							"name": "DB Session State",
							"self": "http://localhost:9940/element/2"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 15,
						"path": ["AVT", "Key/Value Store"],
						"name": "Key/Value Store",
						"self": "http://localhost:9940/element/15",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 5,
							"path": ["Cloud Application", "DB Technologies", "Key/Value Store"],
							"name": "Key/Value Store",
							"self": "http://localhost:9940/element/5"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 11,
						"path": ["AVT", "Server Session State"],
						"name": "Server Session State",
						"self": "http://localhost:9940/element/11",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "Keep session state on web server\r\n\r\n# Pros\r\n\r\n* ...\r\n* ...",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 1,
							"path": ["Cloud Application", "Session Management", "Server Session State"],
							"name": "Server Session State",
							"self": "http://localhost:9940/element/1"
						}
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dksMapping').respond({"items":[{"id":19,"taskTemplate":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"dksNode":"3"},{"id":29,"taskTemplate":{"id":26,"properties":[{"id":27,"property":{"id":6,"name":"Assignee"},"value":"Customer"},{"id":28,"property":{"id":7,"name":"Type"},"value":"Task"}],"parent":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"name":"Rank criterions"},"dksNode":"3"},{"id":35,"taskTemplate":{"id":31,"properties":[{"id":32,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":33,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":34,"property":{"id":8,"name":"Description"},"value":"Rank every item for every criterion."}],"parent":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"name":"Define criterion values"},"dksNode":"3"},{"id":2250,"taskTemplate":{"id":26,"properties":[{"id":27,"property":{"id":6,"name":"Assignee"},"value":"Customer"},{"id":28,"property":{"id":7,"name":"Type"},"value":"Task"}],"parent":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"name":"Rank criterions"},"dksNode":"4"},{"id":2251,"taskTemplate":{"id":20,"properties":[{"id":21,"property":{"id":6,"name":"Assignee"},"value":"DB Developer"},{"id":22,"property":{"id":7,"name":"Type"},"value":"Task"}],"parent":null,"name":"Install DB"},"dksNode":"4"},{"id":2252,"taskTemplate":{"id":31,"properties":[{"id":32,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":33,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":34,"property":{"id":8,"name":"Description"},"value":"Rank every item for every criterion."}],"parent":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"name":"Define criterion values"},"dksNode":"4"},{"id":2253,"taskTemplate":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"dksNode":"4"},{"id":2254,"taskTemplate":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"dksNode":"5"},{"id":2257,"taskTemplate":{"id":38,"properties":[],"parent":{"id":36,"properties":[{"id":37,"property":{"id":7,"name":"Type"},"value":"Task"}],"parent":null,"name":"Hold decision meeting"},"name":"Invite to decision meeting"},"dksNode":"6"},{"id":2258,"taskTemplate":{"id":36,"properties":[{"id":37,"property":{"id":7,"name":"Type"},"value":"Task"}],"parent":null,"name":"Hold decision meeting"},"dksNode":"6"},{"id":2259,"taskTemplate":{"id":31,"properties":[{"id":32,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":33,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":34,"property":{"id":8,"name":"Description"},"value":"Rank every item for every criterion."}],"parent":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"name":"Define criterion values"},"dksNode":"5"},{"id":2260,"taskTemplate":{"id":26,"properties":[{"id":27,"property":{"id":6,"name":"Assignee"},"value":"Customer"},{"id":28,"property":{"id":7,"name":"Type"},"value":"Task"}],"parent":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"name":"Rank criterions"},"dksNode":"5"}]});

				persistenceService = {
					pptAccountRepository: new app.domain.repository.ppt.PPTAccountRepository($http),
					requestTemplateRepository: new app.domain.repository.ppt.RequestTemplateRepository($http),
					projectRepository: new app.domain.repository.core.ProjectRepository($http),
					processorRepository: new app.domain.repository.core.ProcessorRepository($http),
					taskPropertyRepository: new app.domain.repository.core.TaskTemplateRepository($http),
					decisionKnowledgeSystemRepository: new app.domain.repository.dks.DecisionKnowledgeSystemRepository($http),
					projectPlanningToolRepository: new app.domain.repository.ppt.ProjectPlanningToolRepository($http),
					mappingRepository: new app.domain.repository.core.MappingRepository($http),
					optionRepository: new app.domain.repository.dks.OptionRepository($http),
					decisionRepository: new app.domain.repository.dks.DecisionRepository($http)
				};
			}));

			var getAuthenticationServiceWithLoggedInUser = function () {
				httpBackend.when('POST', '/rest/api/1/user/login').respond({"id": 4, "name": "name"});
				httpBackend.when('GET', '/rest/api/1/user/loginStatus').respond({"id": 4, "name": "name"});
				var authenticationService = new app.service.AuthenticationService(http, q);
				authenticationService.login("name", "pw", function () {
				});
				return authenticationService;
			};

			var getPossibleParentByName= function (mappingInformation, parentsName:string){
				for(var i=0;i<mappingInformation.possibleParents.length;i++) {
					if(mappingInformation.possibleParents[i].mapping.taskTemplate.name==parentsName) {
						return mappingInformation.possibleParents[i];
					}
				}
				return null;
			};

			it("can transform mapping with predefined subtasks", function () {
				var scope = rootScope.$new();
				new app.application.TransmissionController(scope, location, persistenceService, getAuthenticationServiceWithLoggedInUser(), http);
				httpBackend.flush();
				expect(scope.allMappingInformation.length).toBe(8);
				scope.processTaskTemplates();
				expect(scope.exportRequests.length).toBe(3); //it has 3 parent requests
				expect(scope.exportRequests[0].subRequests.length).toBe(1); //it has a first request with a child request
				expect(scope.exportRequests[1].subRequests.length).toBe(2); //it has a second request with two child requests
				expect(scope.exportRequests[2].subRequests.length).toBe(2); //it has a third request with two child requests
			});

			it("can transform mapping with predefined subtasks and one subtask of an alternative linked to a decision-task", function () {
				var scope = rootScope.$new();
				new app.application.TransmissionController(scope, location, persistenceService, getAuthenticationServiceWithLoggedInUser(), http);
				httpBackend.flush();
				expect(scope.allMappingInformation.length).toBe(8);
				scope.allMappingInformation[3].selectedParent=getPossibleParentByName(scope.allMappingInformation[3], "Hold decision meeting");
				scope.processTaskTemplates();
				expect(scope.exportRequests.length).toBe(3); //it has 3 parent requests
				expect(scope.exportRequests[0].subRequests.length).toBe(1+1); //it has a first request with a child request and a subtask-child request
				expect(scope.exportRequests[1].subRequests.length).toBe(2-1); //it has a second request with two child requests (but one is gone to the decision task)
				expect(scope.exportRequests[2].subRequests.length).toBe(2); //it has a third request with two child requests
			});

		});

		describe("Mapping of another example situation", function () {
			var http, httpBackend, rootScope, persistenceService, q;

			beforeEach(inject(function ($q, $rootScope, $http, $httpBackend) {
				q = $q;
				http = $http;
				httpBackend = $httpBackend;
				rootScope = $rootScope;

				// for this test most data is not relevant, so it works with an empty result
				httpBackend.when('GET', '/rest/api/1/requestTemplate').respond({
					"items": [{
						"id": 39,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"project": {"id": 2, "name": "Project"},
						"name": "Jira Request Template",
						"url": "/rest/api/2/issue",
						"requestBodyTemplate": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"${pptProject}\"\n\t\t},\n\t\t$!ifElse:(parentRequestData.key,\" \"parent\": {\n\t\t\t\"key\": \"$!{parentRequestData.key}\"\n\t\t}\\, \", \"\")$\n\t\t\"summary\": \"${taskTemplate.name}\",\n\t\t\"description\": \"${taskTemplate.attributes.Description}. \\nDecision: ${node.name}\\nDKS link: ${node.self}\\nAttributes:\\n$objectToString:(node.attributes, \": \", \"\\n\")$\",\n\t\t$ifElse:(taskTemplate.attributes.Due Date,\" \"duedate\": \"${taskTemplate.attributes.Due Date}\"\\, \", \"\")$\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"$!ifElse:(parentRequestData.key,\"Sub-task\", \"${taskTemplate.attributes.Type}\")$\"\n\t\t},\n\t\t$ifElse:(taskTemplate.attributes.Priority, \" \"priority\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Priority}\"\n\t\t}\\, \", \"\")$\n\t\t$mapExistingAssignees:(taskTemplate.attributes.Assignee, \"Project Planner:admin\\,Customer:admin\\,Architect:admin\",\" \"assignee\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Assignee}\"\n\t\t}\\, \")$\n\t\t$ifElse:(taskTemplate.attributes.Estimated Duration, \" \"timetracking\": {\n\t\t\t\"originalEstimate\": \"${taskTemplate.attributes.Estimated Duration}\"\n\t\t}\\, \", \"\")$\n\t\t\"labels\": [\"${node.attributes.Intellectual Property Rights}\", \"${node.attributes.Project Stage}\", \"createdByEEPPI\"]\n\t}\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/requestTemplate').respond({
					"items": [{
						"id": 39,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"project": {"id": 2, "name": "Project"},
						"name": "Jira Request Template",
						"url": "/rest/api/2/issue",
						"requestBodyTemplate": "{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"${pptProject}\"\n\t\t},\n\t\t$!ifElse:(parentRequestData.key,\" \"parent\": {\n\t\t\t\"key\": \"$!{parentRequestData.key}\"\n\t\t}\\, \", \"\")$\n\t\t\"summary\": \"${taskTemplate.name}\",\n\t\t\"description\": \"${taskTemplate.attributes.Description}. \\nDecision: ${node.name}\\nDKS link: ${node.self}\\nAttributes:\\n$objectToString:(node.attributes, \": \", \"\\n\")$\",\n\t\t$ifElse:(taskTemplate.attributes.Due Date,\" \"duedate\": \"${taskTemplate.attributes.Due Date}\"\\, \", \"\")$\n\t\t\"issuetype\": {\n\t\t\t\"name\": \"$!ifElse:(parentRequestData.key,\"Sub-task\", \"${taskTemplate.attributes.Type}\")$\"\n\t\t},\n\t\t$ifElse:(taskTemplate.attributes.Priority, \" \"priority\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Priority}\"\n\t\t}\\, \", \"\")$\n\t\t$mapExistingAssignees:(taskTemplate.attributes.Assignee, \"Project Planner:admin\\,Customer:admin\\,Architect:admin\",\" \"assignee\": {\n\t\t\t\"name\": \"${taskTemplate.attributes.Assignee}\"\n\t\t}\\, \")$\n\t\t$ifElse:(taskTemplate.attributes.Estimated Duration, \" \"timetracking\": {\n\t\t\t\"originalEstimate\": \"${taskTemplate.attributes.Estimated Duration}\"\n\t\t}\\, \", \"\")$\n\t\t\"labels\": [\"${node.attributes.Intellectual Property Rights}\", \"${node.attributes.Project Stage}\", \"createdByEEPPI\"]\n\t}\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/user/pptAccount').respond({
					"items": [{
						"id": 5,
						"ppt": {"id": 1, "name": "Project Planning Tool"},
						"pptUrl": "http://localhost:9920",
						"user": {"id": 4, "name": "demo"},
						"pptUsername": "admin"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/project').respond({"items": [{"id": 2, "name": "Project"}]});
				httpBackend.when('GET', '/rest/api/1/processor').respond({
					"items": [{
						"id": 40,
						"name": "objectToString",
						"project": {"id": 2, "name": "Project"},
						"code": "function(list, separator1, separator2) {\n\tvar separator1 = separator1 || \": \";\n\tvar separator2 = separator2 || \", \";\n\tvar text = \"\";\n\tvar keys = Object.keys(list);\n\tkeys.forEach(function(key, index){\n\t\ttext += key+separator1+list[key];\n\t\tif(index < keys.length-1) { text += separator2; }\n\t});\n\treturn text;\n}"
					}, {
						"id": 41,
						"name": "ifElse",
						"project": {"id": 2, "name": "Project"},
						"code": "function(condition, ifField, elseField) {\n\t\tif(condition && ifField) {\n\t\t\treturn ifField;\n\t\t} else {\n\t\t\treturn elseField;\n\t\t}\n}"
					}, {
						"id": 42,
						"name": "mapExistingAssignees",
						"project": {"id": 2, "name": "Project"},
						"code": "function(assignee, existingAssignees, assigneeJSON) {\n\t\tif(assignee && existingAssignees && assigneeJSON) {\n\t\t\tvar assigneeMappingList = existingAssignees.split(\",\");\n\t\t\tvar assigneeMapping = {};\n\t\t\tfor(var ami in assigneeMappingList) {\n\t\t\t\tvar assigneeName = assigneeMappingList[ami].split(\":\")[0].trim();\n\t\t\t\tassigneeMapping[assigneeName] = assigneeMappingList[ami].split(\":\")[1].trim();\n\t\t\t}\n\t\t\tif(assigneeMapping[assignee]) {\n\t\t\t\treturn assigneeJSON.replace(assignee, assigneeMapping[assignee]);\n\t\t\t} else {\n\t\t\t\treturn \"\";\n\t\t\t}\n\t\t} else {\n\t\t\treturn \"\";\n\t\t}\n}"
					}, {
						"id": 43,
						"name": "taggedValue",
						"project": {"id": 2, "name": "Project"},
						"code": "function(values, name) {\n\t\treturn (values && name && values[name]) ? values[name] : \"\";\n}"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks').respond({
					"items": [{
						"id": 3,
						"name": "DKS",
						"url": "http://localhost:9940"
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks/getFromDKS?url=http%3A%2F%2Flocalhost%3A9940%2Felement%3Fquery%3Dtype%2520is%2520%2522ProblemOccurrence%2522').respond({
					"startAt": 0,
					"maxResults": 2147483647,
					"length": 3,
					"elements": [{
						"type": "ProblemOccurrence",
						"id": 19,
						"path": ["AVT", "Cloud Providers", "Service Model"],
						"name": "Service Model",
						"self": "http://localhost:9940/element/19",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "Which xaaS Service Model does the provider support/ and/or does the consumer use? The term service model is introduced in the NIST definition of cloud computing and has been adopted widely by book authors, vendors and consultants.\r\n\r\nSee CCP website for more information (direct link: http://www.cloudcomputingpatterns.org/Category:Cloud_Service_Models).",
						"state": "PartiallySolved",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 17,
							"path": ["AVT", "Cloud Providers", "IaaS"],
							"name": "IaaS",
							"self": "http://localhost:9940/element/17"
						}, {
							"type": "OptionOccurrence",
							"id": 18,
							"path": ["AVT", "Cloud Providers", "PaaS"],
							"name": "PaaS",
							"self": "http://localhost:9940/element/18"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 10,
							"path": ["Cloud Application", "Cloud Providers", "Service Model"],
							"name": "Service Model",
							"self": "http://localhost:9940/element/10"
						}
					}, {
						"type": "ProblemOccurrence",
						"id": 16,
						"path": ["AVT", "DB Model"],
						"name": "DB Model",
						"self": "http://localhost:9940/element/16",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "",
						"state": "Open",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 15,
							"path": ["AVT", "Key/Value Store"],
							"name": "Key/Value Store",
							"self": "http://localhost:9940/element/15"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 6,
							"path": ["Cloud Application", "DB Technologies", "DB Model"],
							"name": "DB Model",
							"self": "http://localhost:9940/element/6"
						}
					}, {
						"type": "ProblemOccurrence",
						"id": 14,
						"path": ["AVT", "Session State Management"],
						"name": "Session State Management",
						"self": "http://localhost:9940/element/14",
						"attributes": {
							"Revision Date": "2016-11-11",
							"Viewpoint": "Scenario",
							"Intellectual Property Rights": "Unrestricted",
							"Due Date": "2014-12-24",
							"Project Stage": "Inception",
							"Organisational Reach": "Project",
							"Stakeholder Roles": "Any",
							"Owner Role": "Lead Architect"
						},
						"notes": "How to manage session state on servers?",
						"state": "PartiallySolved",
						"alternatives": [{
							"type": "OptionOccurrence",
							"id": 11,
							"path": ["AVT", "Server Session State"],
							"name": "Server Session State",
							"self": "http://localhost:9940/element/11"
						}, {
							"type": "OptionOccurrence",
							"id": 13,
							"path": ["AVT", "Cloud Session State"],
							"name": "Cloud Session State",
							"self": "http://localhost:9940/element/13"
						}, {
							"type": "OptionOccurrence",
							"id": 12,
							"path": ["AVT", "DB Session State"],
							"name": "DB Session State",
							"self": "http://localhost:9940/element/12"
						}],
						"template": {
							"type": "ProblemTemplate",
							"id": 3,
							"path": ["Cloud Application", "Session Management", "Session State Management"],
							"name": "Session State Management",
							"self": "http://localhost:9940/element/3"
						}
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dks/getFromDKS?url=http%3A%2F%2Flocalhost%3A9940%2Felement%3Fquery%3Dtype%2520is%2520%2522OptionOccurrence%2522').respond({
					"startAt": 0,
					"maxResults": 2147483647,
					"length": 6,
					"elements": [{
						"type": "OptionOccurrence",
						"id": 17,
						"path": ["AVT", "Cloud Providers", "IaaS"],
						"name": "IaaS",
						"self": "http://localhost:9940/element/17",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "http://www.cloudcomputingpatterns.org/Infrastructure_as_a_Service_(IaaS)",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 7,
							"path": ["Cloud Application", "Cloud Providers", "IaaS"],
							"name": "IaaS",
							"self": "http://localhost:9940/element/7"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 18,
						"path": ["AVT", "Cloud Providers", "PaaS"],
						"name": "PaaS",
						"self": "http://localhost:9940/element/18",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "http://www.cloudcomputingpatterns.org/Platform_as_a_Service_(PaaS)\r\n\r\nNote that the boundary between IaaS and Paas is somewhat blurred. e.g. does the operating system belong to the PaaS model, or is it still IaaS? Literature does not agree here; CCP sticks to NIST point of view, which sees operating system as PaaS (is this practical?)",
						"state": "Neglected",
						"template": {
							"type": "OptionTemplate",
							"id": 8,
							"path": ["Cloud Application", "Cloud Providers", "PaaS"],
							"name": "PaaS",
							"self": "http://localhost:9940/element/8"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 13,
						"path": ["AVT", "Cloud Session State"],
						"name": "Cloud Session State",
						"self": "http://localhost:9940/element/13",
						"attributes": {"Intellectual Property Rights": "Confidential"},
						"notes": "Store session state on ultra secret cloud service",
						"state": "Neglected",
						"template": null
					}, {
						"type": "OptionOccurrence",
						"id": 12,
						"path": ["AVT", "DB Session State"],
						"name": "DB Session State",
						"self": "http://localhost:9940/element/12",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "Persist session state on remote DB",
						"state": "Chosen",
						"template": {
							"type": "OptionTemplate",
							"id": 2,
							"path": ["Cloud Application", "Session Management", "DB Session State"],
							"name": "DB Session State",
							"self": "http://localhost:9940/element/2"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 15,
						"path": ["AVT", "Key/Value Store"],
						"name": "Key/Value Store",
						"self": "http://localhost:9940/element/15",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 5,
							"path": ["Cloud Application", "DB Technologies", "Key/Value Store"],
							"name": "Key/Value Store",
							"self": "http://localhost:9940/element/5"
						}
					}, {
						"type": "OptionOccurrence",
						"id": 11,
						"path": ["AVT", "Server Session State"],
						"name": "Server Session State",
						"self": "http://localhost:9940/element/11",
						"attributes": {"Intellectual Property Rights": "Unrestricted"},
						"notes": "Keep session state on web server\r\n\r\n# Pros\r\n\r\n* ...\r\n* ...",
						"state": "Eligible",
						"template": {
							"type": "OptionTemplate",
							"id": 1,
							"path": ["Cloud Application", "Session Management", "Server Session State"],
							"name": "Server Session State",
							"self": "http://localhost:9940/element/1"
						}
					}]
				});
				httpBackend.when('GET', '/rest/api/1/dksMapping').respond({"items":[{"id":19,"taskTemplate":{"id":12,"properties":[{"id":13,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":14,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":15,"property":{"id":8,"name":"Description"},"value":"Define criterions for evaluation"},{"id":16,"property":{"id":9,"name":"Priority"},"value":"Major"},{"id":17,"property":{"id":10,"name":"Due Date"},"value":"2015-01-14"},{"id":18,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"Define criterions"},"dksNode":"3"},{"id":29,"taskTemplate":{"id":26,"properties":[{"id":27,"property":{"id":6,"name":"Assignee"},"value":"Customer"},{"id":28,"property":{"id":7,"name":"Type"},"value":"Task"}],"parent":null,"name":"Rank criterions"},"dksNode":"3"},{"id":30,"taskTemplate":{"id":26,"properties":[{"id":27,"property":{"id":6,"name":"Assignee"},"value":"Customer"},{"id":28,"property":{"id":7,"name":"Type"},"value":"Task"}],"parent":null,"name":"Rank criterions"},"dksNode":"6"},{"id":35,"taskTemplate":{"id":31,"properties":[{"id":32,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":33,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":34,"property":{"id":8,"name":"Description"},"value":"Rank every item for every criterion."}],"parent":null,"name":"Define criterion values"},"dksNode":"3"},{"id":2261,"taskTemplate":{"id":2251,"properties":[{"id":2255,"property":{"id":8,"name":"Description"},"value":"desc"},{"id":2257,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":2258,"property":{"id":10,"name":"Due Date"},"value":"14.14.14"},{"id":2259,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":2260,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"2 Do something"},"dksNode":"214"},{"id":2262,"taskTemplate":{"id":2252,"properties":[],"parent":null,"name":"3 Bla Bla"},"dksNode":"210"},{"id":2263,"taskTemplate":{"id":2250,"properties":[],"parent":{"id":2252,"properties":[],"parent":null,"name":"3 Bla Bla"},"name":"1 Hau rein"},"dksNode":"210"},{"id":2264,"taskTemplate":{"id":2251,"properties":[{"id":2255,"property":{"id":8,"name":"Description"},"value":"desc"},{"id":2257,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":2258,"property":{"id":10,"name":"Due Date"},"value":"14.14.14"},{"id":2259,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":2260,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"2 Do something"},"dksNode":"210"},{"id":2265,"taskTemplate":{"id":2250,"properties":[],"parent":{"id":2252,"properties":[],"parent":null,"name":"3 Bla Bla"},"name":"1 Hau rein"},"dksNode":"4"},{"id":2266,"taskTemplate":{"id":2252,"properties":[],"parent":null,"name":"3 Bla Bla"},"dksNode":"4"},{"id":2267,"taskTemplate":{"id":2251,"properties":[{"id":2255,"property":{"id":8,"name":"Description"},"value":"desc"},{"id":2257,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":2258,"property":{"id":10,"name":"Due Date"},"value":"14.14.14"},{"id":2259,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":2260,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"2 Do something"},"dksNode":"5"},{"id":2268,"taskTemplate":{"id":2253,"properties":[],"parent":{"id":2251,"properties":[{"id":2255,"property":{"id":8,"name":"Description"},"value":"desc"},{"id":2257,"property":{"id":6,"name":"Assignee"},"value":"Project Planner"},{"id":2258,"property":{"id":10,"name":"Due Date"},"value":"14.14.14"},{"id":2259,"property":{"id":7,"name":"Type"},"value":"Task"},{"id":2260,"property":{"id":11,"name":"Estimated Duration"},"value":"10h"}],"parent":null,"name":"2 Do something"},"name":"2.1 Autscha"},"dksNode":"5"}]});

				persistenceService = {
					pptAccountRepository: new app.domain.repository.ppt.PPTAccountRepository($http),
					requestTemplateRepository: new app.domain.repository.ppt.RequestTemplateRepository($http),
					projectRepository: new app.domain.repository.core.ProjectRepository($http),
					processorRepository: new app.domain.repository.core.ProcessorRepository($http),
					taskPropertyRepository: new app.domain.repository.core.TaskTemplateRepository($http),
					decisionKnowledgeSystemRepository: new app.domain.repository.dks.DecisionKnowledgeSystemRepository($http),
					projectPlanningToolRepository: new app.domain.repository.ppt.ProjectPlanningToolRepository($http),
					mappingRepository: new app.domain.repository.core.MappingRepository($http),
					optionRepository: new app.domain.repository.dks.OptionRepository($http),
					decisionRepository: new app.domain.repository.dks.DecisionRepository($http)
				};
			}));

			var getAuthenticationServiceWithLoggedInUser = function () {
				httpBackend.when('POST', '/rest/api/1/user/login').respond({"id": 4, "name": "name"});
				httpBackend.when('GET', '/rest/api/1/user/loginStatus').respond({"id": 4, "name": "name"});
				var authenticationService = new app.service.AuthenticationService(http, q);
				authenticationService.login("name", "pw", function () {
				});
				return authenticationService;
			};

			it("can transform mapping", function () {
				var scope = rootScope.$new();
				new app.application.TransmissionController(scope, location, persistenceService, getAuthenticationServiceWithLoggedInUser(), http);
				httpBackend.flush();
				expect(scope.allMappingInformation.length).toBe(6);
				scope.processTaskTemplates();
				expect(scope.exportRequests.length).toBe(5); //it has 3 parent requests
				expect(scope.exportRequests[0].subRequests.length).toBe(0); //it has a first request with no child requests
				expect(scope.exportRequests[1].subRequests.length).toBe(1); //it has a second request with one child request
				expect(scope.exportRequests[2].subRequests.length).toBe(0); //it has a third request with no child requests
				expect(scope.exportRequests[3].subRequests.length).toBe(0); //it has a fourth request with no child requests
				expect(scope.exportRequests[4].subRequests.length).toBe(0); //it has a fifth request with no child requests
			});

		});
	}
}