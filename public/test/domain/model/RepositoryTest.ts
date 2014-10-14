/// <reference path='../../../resources/libraries/jasmin/ts/jasmine.d.ts' />
/// <reference path='../../../resources/libraries/angularJs/angular.d.ts' />
/// <reference path='../../.././module/MainModule.ts' />

/// <reference path='../../.././domain/model/Node.ts' />
/// <reference path='../../.././domain/repository/PersistentEntity.ts' />
/// <reference path='../../.././domain/repository/Repository.ts' />

module test {
	export module helper {
		export class Dummy implements dks.Node, core.PersistentEntity {
			public static createFromJson(object: any): Dummy {
				var domainObject = new Dummy(object.name);
				domainObject.id = object.id;

				return domainObject;
			}

			public id: number;
			public name: string;

			constructor(name: string) {
				this.id = Math.round(Math.random()*1000000);
				this.name = name;
			}
		}

		export class DummyRepository extends core.Repository<Dummy> {
			constructor(httpService) {
				super(httpService);
				this.type = Dummy;
				this.resources = {
					'all': 'data/api/dummy/list.json'
				};
			}
		}

		export function dummyFactory(id: number, name: string): Dummy {
			var dummy: Dummy = new Dummy(name);
			dummy.id = id;
			return dummy;
		}
	}
}

module test {
	export function RepositoryTest() {
		describe("Repository class suite", function() {

			it("create a 'Dummy' object from JSON", function() {
				var dummy: test.helper.Dummy = new helper.Dummy("dummy1");
				var data: any = { "id": dummy.id, "name": "dummy1" };

				expect(helper.Dummy.createFromJson(data)).toEqual(dummy);
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
				expect(dummies).toEqual([helper.dummyFactory(1,"DummyObject1"), helper.dummyFactory(2,"DummyObject2")]);
			}));
		});
	}
}
