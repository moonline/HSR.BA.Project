/// <reference path='../test/libraries/declarations/jasmin/jasmine.d.ts' />
/// <reference path='../test/classes/domain/model/RepositoryTest.ts' />
/// <reference path='../test/classes/domain/factory/ObjectFactoryTest.ts' />
/// <reference path='../test/classes/service/AuthenticationServiceTest.ts' />

module test {
	describe("Domain test suite", function() {
		describe("Model test suite", function() {
			RepositoryTest();
		});
		describe("Factory test suite", function() {
			ObjectFactoryTest();
		});
	});

	describe("Service test suite", function() {
		AuthenticationServiceTest();
	});
}