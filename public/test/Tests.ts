/// <reference path='../test/libraries/declarations/jasmin/jasmine.d.ts' />
/// <reference path='../test/classes/domain/repository/RepositoryTest.ts' />
/// <reference path='../test/classes/domain/factory/ObjectFactoryTest.ts' />
/// <reference path='../test/classes/service/AuthenticationServiceTest.ts' />
/// <reference path='../test/classes/application/MappingControllerTest.ts' />

module test {
	describe("Domain test suite", function() {
		describe("Repository test suite", function() {
			RepositoryTest();
		});
		describe("Factory test suite", function() {
			ObjectFactoryTest();
		});
	});

	describe("Application test suite", function() {
		MappingControllerTest();
	});

	describe("Service test suite", function() {
		AuthenticationServiceTest();
	});
}