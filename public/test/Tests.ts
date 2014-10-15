/// <reference path='../test/libraries/declarations/jasmin/jasmine.d.ts' />
/// <reference path='../test/classes/domain/model/RepositoryTest.ts' />
/// <reference path='../test/classes/service/AuthenticationServiceTest.ts' />

module test {
	describe("Domain test suite", function() {
		describe("Model test suite", function() {
			RepositoryTest();
		});
		describe("Service test suite", function() {
			AuthenticationServiceTest();
		});
	});
}