/// <reference path='../../includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/repository/PPTAccountRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/RequestTemplateRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/ProjectRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/ProcessorRepository.ts' />
/// <reference path='../../../../app/assets/scripts/classes/domain/repository/TaskTemplateRepository.ts' />

/// <reference path='../../../../app/assets/scripts/classes/application/AdminController.ts' />

module test.integration.application {
    export function AdminControllerTest() {
        describe("Admin controller class suite", function () {
            var http, httpBackend, rootScope, persistenceService;

            beforeEach(inject(function ($rootScope, $http, $httpBackend) {
                http = $http;
                httpBackend = $httpBackend;
                rootScope = $rootScope;

                // for this test most data is not relevant, so it works with an empty result
                httpBackend.when('GET', '/taskTemplate').respond({});
                httpBackend.when('GET', '/taskProperty').respond({});
                httpBackend.when('GET', '/user/pptAccount').respond({});
				httpBackend.when('GET', '/ppt').respond({});
                httpBackend.when('GET', '/requestTemplate').respond({});
                httpBackend.when('GET', '/project').respond({"items": [
                    {"id": 59, "name": "Project"}
                ]});
                httpBackend.when('GET', '/processor').respond({"items": [
                    {"id": 4401, "name": "Test 1", "project": {"id": 59, "name": "Project"}, "code": "imagine example function here"},
                    {"id": 4404, "name": "Test 2", "project": {"id": 59, "name": "Project"}, "code": "function x(){anything};"}
                ]});
                httpBackend.when('GET','/dks').respond({
                    "items": [
                        {
                            "id": 1,
                            "name": "The DKS",
                            "url": "http://localhost:9940"
                        }
                    ]
                });

                persistenceService = {
                    pptAccountRepository: new app.domain.repository.ppt.PPTAccountRepository($http),
                    requestTemplateRepository: new app.domain.repository.ppt.RequestTemplateRepository($http),
                    projectRepository: new app.domain.repository.core.ProjectRepository($http),
                    processorRepository: new app.domain.repository.core.ProcessorRepository($http),
                    taskPropertyRepository: new app.domain.repository.core.TaskTemplateRepository($http),
                    decisionKnowledgeSystemRepository: new app.domain.repository.dks.DecisionKnowledgeSystemRepository($http),
					projectPlanningToolRepository: new app.domain.repository.ppt.ProjectPlanningToolRepository($http)
                };
            }));

            it("loaded a project to create a new processor for", function () {
                var scope = rootScope.$new();
                new app.application.AdminController(scope, persistenceService);
                httpBackend.flush();

                expect(scope.projects.length).toBe(1);
            });

            it("can create a new processor", function () {
                var scope = rootScope.$new();
                new app.application.AdminController(scope, persistenceService);
                httpBackend.flush();
                var initialProcessorsCount:number = scope.processors.length;

                var processor:app.domain.model.core.Processor = scope.createProcessor("The new Processor", scope.projects[0], "function x(){anything};");

                httpBackend.expectPOST('/processor', processor).respond({});
                httpBackend.flush();

                expect(scope.processors.length).toBe(initialProcessorsCount + 1);
            });

            it("can update an existing processor", function () {
                var scope = rootScope.$new();
                new app.application.AdminController(scope, persistenceService);
                httpBackend.flush();

                expect(scope.processors.length).toBeGreaterThan(0);
                var processor:app.domain.model.core.Processor = scope.processors[0];
                scope.toUpdateProcessor = processor;
                scope.updateWithCorrectProjectAndPPT(scope.toUpdateProcessor);
                expect(scope.toUpdateProcessor.name).toBe(processor.name);
                expect(scope.toUpdateProcessor.project.id).toBe(processor.project.id);
                expect(scope.toUpdateProcessor.code).toBe(processor.code);

                scope.toUpdateProcessor.name = "Test3";
                scope.toUpdateProcessor.project = scope.projects[0];
                scope.toUpdateProcessor.code = "function y();";
                scope.hasToUpdateProcessorChanged = true;
                scope.updateProcessor(scope.toUpdateProcessor);

                httpBackend.expectPOST('/processor/4401', '{"id":4401,"name":"Test3","project":{"id":59,"name":"Project"},"code":"function y();"}').respond({});
                httpBackend.flush();
            });

            it("can delete an existing processor", function () {
                var scope = rootScope.$new();
                new app.application.AdminController(scope, persistenceService);
                httpBackend.flush();

                expect(scope.processors.length).toBeGreaterThan(0);
                var processor:app.domain.model.core.Processor = scope.processors[0];
                scope.removeProcessor(processor);
                httpBackend.expectPOST('/processor/4401/delete', "{}").respond({});
                httpBackend.flush();
            });
        });
    }
}