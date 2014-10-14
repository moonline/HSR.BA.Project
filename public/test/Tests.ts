/// <reference path='../resources/libraries/jasmin/ts/jasmine.d.ts' />
/// <reference path='../test/domain/model/RepositoryTest.ts' />

module test {
	describe("Domain test suite", function() {
		describe("Model test suite", function() {
			RepositoryTest();
		});
	});
}