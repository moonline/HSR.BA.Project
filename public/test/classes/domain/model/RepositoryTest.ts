/// <reference path='../../../../../public/test/includes.ts' />

/// <reference path='../../../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/Repository.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/factory/ObjectFactory.ts' />

module test {
	export module helper {
		export class DummyRepository extends core.Repository<Dummy> {
			constructor(httpService) {
				super(httpService);
				this.type = Dummy;
				this.resources = {
					'all': 'data/api/dummy/list.json'
				};
			}
		}
	}
}

module test {
	export function RepositoryTest() {
		describe("Repository class suite", function() {

			it("create a 'Dummy' object from JSON", function() {
				var dummy: test.helper.Dummy = new helper.Dummy("dummy1");
				var data: any = { "id": dummy.id, "name": "dummy1" };

				expect(core.ObjectFactory.createFromJson<helper.Dummy>(helper.Dummy,data)).toEqual(dummy);
			});

			it("get Dummies using repository.findAll()",angular.mock.inject(function($httpBackend, $http) {
				// Crappy passThrough() not working :-(
				$httpBackend.when("GET", 'data/api/dummy/list.json').respond({
					"items": [
						{
							"id": 1,
							"name": "DummyObject1"

						},
						{
							"id": 2,
							"name": "DummyObject2"

						}
					]
				});
				var repository: helper.DummyRepository = new helper.DummyRepository($http);
				var dummies: helper.Dummy[];

				repository.findAll(function(items: helper.Dummy[]) {
					dummies = items;
				});
				$httpBackend.flush();
				expect(dummies).toEqual([helper.Dummy.createDummy(1,"DummyObject1"), helper.Dummy.createDummy(2,"DummyObject2")]);
			}));
		});
	}
}
