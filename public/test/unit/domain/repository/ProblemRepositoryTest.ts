/// <reference path='../../../../../public/test/includes.ts' />

/// <reference path='../../../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/model/DksNode.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/Repository.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/ProblemRepository.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/AlternativeRepository.ts' />

module test.logic.domain.repository {
	export function ProblemRepositoryTest() {
		describe("Problem repository class suite", function(){
			it("Find problems and alternatives", angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.expectGET('/element?query=type%20is%20%22ProblemTemplate%22').respond({
					elements: [
						{
							type: "ProblemTemplate",
							id: 10,
							name: "Service Model",
							alternatives: [
								{
									"id": 9
								},
								{
									"id": 8
								}
							]
						}
					]
				});

				$httpBackend.expectGET('/element?query=type%20is%20%22OptionTemplate%22').respond({
					elements: [
						{
							path: ["OptionTemplate"],
							"id": 9,
							"name": "SaaS"
						},
						{
							path: ["OptionTemplate"],
							"id": 8,
							"name": "PaaS"
						}
					]
				});

				var alternativeRepository:app.domain.repository.dks.AlternativeRepository = new app.domain.repository.dks.AlternativeRepository($http);
				var problemRepository:app.domain.repository.dks.ProblemRepository = new app.domain.repository.dks.ProblemRepository($http);

				alternativeRepository.proxy = null;
				problemRepository.proxy = null;

				var status;
				var problems;
				problemRepository.findAllWithNodesAndSubNodes<app.domain.model.dks.Alternative>('alternatives', alternativeRepository, function(success, items) {
					status = success;
					problems = items;
				});

				$httpBackend.flush();
				expect(status).toEqual(true);
				expect(problems[0].alternatives[0].name).toEqual("SaaS");
				expect(problems[0].alternatives[0].path).toEqual(["OptionTemplate"]);
				expect(problems[0].alternatives[1].name).toEqual("PaaS");
				expect(problems[0].alternatives[1].path).toEqual(["OptionTemplate"]);
			}));
		});
	}
}