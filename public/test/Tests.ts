/// <reference path='../test/libraries/declarations/jasmin/jasmine.d.ts' />
/// <reference path='../test/classes/domain/repository/RepositoryTest.ts' />
/// <reference path='../test/classes/domain/factory/ObjectFactoryTest.ts' />
/// <reference path='../test/classes/service/AuthenticationServiceTest.ts' />
/// <reference path='../test/classes/application/MappingControllerTest.ts' />

module test {
	describe("Domain test suite", function() {
		describe("Repository test suite", function() {
			test.domain.repository.RepositoryTest();
		});
		describe("Factory test suite", function() {
			test.domain.factory.ObjectFactoryTest();
		});
	});

	describe("Application test suite", function() {
		test.application.MappingControllerTest();
	});

	describe("Service test suite", function() {
		test.service.AuthenticationServiceTest();
	});
}