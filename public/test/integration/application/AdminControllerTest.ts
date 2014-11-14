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
                httpBackend.when('GET', '/pptMapping').respond({});
                httpBackend.when('GET', '/project').respond({"items": [
                    {"id": 59, "name": "Project"}
                ]});
                httpBackend.when('GET', '/processor').respond({"items": [
                    {"id": 4401, "name": "Test 1", "project": {"id": 59, "name": "Project"}, "code": "imagine example function here"},
                    {"id": 4404, "name": "Test 2", "project": {"id": 59, "name": "Project"}, "code": "function x(){anything};"}
                ]});

                persistenceService = {
                    pptAccountRepository: new app.domain.repository.ppt.PPTAccountRepository($http),
                    requestTemplateRepository: new app.domain.repository.ppt.RequestTemplateRepository($http),
                    projectRepository: new app.domain.repository.core.ProjectRepository($http),
                    processorRepository: new app.domain.repository.core.ProcessorRepository($http),
                    taskPropertyRepository: new app.domain.repository.core.TaskTemplateRepository($http)
                };
            }));

            it("loaded a project to create a new processor for", function () {
                var scope = rootScope.$new();
                new app.application.AdminController(scope, location, http, persistenceService, null);
                httpBackend.flush();

                expect(scope.projects.length).toBe(1);
            });

            it("can create a new processor", function () {
                var scope = rootScope.$new();
                new app.application.AdminController(scope, location, http, persistenceService, null);
                httpBackend.flush();
                var initialProcessorsCount:number = scope.processors.length;

                var processor:app.domain.model.core.Processor = scope.createProcessor("The new Processor", scope.projects[0], "function x(){anything};");

                httpBackend.expectPOST('/processor', processor).respond({});
                httpBackend.flush();

                expect(scope.processors.length).toBe(initialProcessorsCount + 1);
            });

            it("can update an existing processor", function () {
                var scope = rootScope.$new();
                new app.application.AdminController(scope, location, http, persistenceService, null);
                httpBackend.flush();

                expect(scope.processors.length).toBeGreaterThan(0);
                var processor:app.domain.model.core.Processor = scope.processors[0];
                scope.toUpdateProcessor = processor;
                scope.showSelectedProcessor();
                expect(scope.processorNewName).toBe(processor.name);
                expect(scope.processorNewProject.id).toBe(processor.project.id);
                expect(scope.processorNewCode).toBe(processor.code);

                scope.updateProcessor(scope.toUpdateProcessor, "Test3", scope.processorNewProject, "function y();");
                httpBackend.expectPOST('/processor/4401', '{"id":4401,"name":"Test3","project":{"id":59,"name":"Project"},"code":"function y();"}').respond({});
                httpBackend.flush();
            });

            it("can delete an existing processor", function () {
                var scope = rootScope.$new();
                new app.application.AdminController(scope, location, http, persistenceService, null);
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