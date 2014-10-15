/// <reference path='../test/libraries/declarations/jasmin/jasmine.d.ts' />
/// <reference path='../test/classes/domain/model/RepositoryTest.ts' />

module test {
	describe("Domain test suite", function() {
		describe("Model test suite", function() {
			RepositoryTest();
		});
	});
}