/// <reference path='../test/libraries/declarations/jasmin/jasmine.d.ts' />
/// <reference path='../test/logic/domain/repository/RepositoryTest.ts' />
/// <reference path='../test/logic/domain/repository/TaskTemplateRepositoryTest.ts' />
/// <reference path='../test/logic/domain/factory/ObjectFactoryTest.ts' />
/// <reference path='../test/logic/service/AuthenticationServiceTest.ts' />
/// <reference path='../test/integration/application/MappingControllerTest.ts' />

module test {
	describe("Logic tests", function(){
		describe("Domain test suite", function() {
			describe("Repository test suite", function() {
				test.logic.domain.repository.RepositoryTest();
				test.logic.domain.repository.TaskTemplateRepositoryTest();
			});
			describe("Factory test suite", function() {
				test.logic.domain.factory.ObjectFactoryTest();
			});
		});

		describe("Service test suite", function() {
			test.logic.service.AuthenticationServiceTest();
		});
	});

	describe("Integration tests", function(){
		describe("Application test suite", function() {
			test.integration.application.MappingControllerTest();
		});
	});
}