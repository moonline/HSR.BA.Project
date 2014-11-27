/// <reference path='includes/libraries/declarations/jasmin/jasmine.d.ts' />
/// <reference path='unit/domain/repository/RepositoryTest.ts' />
/// <reference path='unit/domain/repository/TaskTemplateRepositoryTest.ts' />
/// <reference path='unit/domain/repository/ProblemRepositoryTest.ts' />
/// <reference path='unit/domain/repository/MappingRepositoryTest.ts' />
/// <reference path='unit/domain/factory/ObjectFactoryTest.ts' />
/// <reference path='unit/service/AuthenticationServiceTest.ts' />
/// <reference path='unit/service/TemplateProcesserTest.ts' />
/// <reference path='../test/integration/application/AdminControllerTest.ts' />
/// <reference path='../test/integration/application/MappingControllerTest.ts' />

module test {
	describe("Logic tests", function(){
		describe("Domain test suite", function() {
			describe("Repository test suite", function() {
				test.logic.domain.repository.RepositoryTest();
				test.logic.domain.repository.TaskTemplateRepositoryTest();
				test.logic.domain.repository.MappingRepositoryTest();
				test.logic.domain.repository.ProblemRepositoryTest();
			});
			describe("Factory test suite", function() {
				test.logic.domain.factory.ObjectFactoryTest();
			});
		});

		describe("Service test suite", function() {
			test.logic.service.AuthenticationServiceTest();
			test.logic.service.TemplateProcesserTest();
		});
	});

	describe("Integration tests", function(){
		describe("Application test suite", function() {
			test.integration.application.AdminControllerTest();
			test.integration.application.MappingControllerTest();
		});
	});
}