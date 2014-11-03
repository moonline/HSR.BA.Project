/// <reference path='../../../../../public/test/includes.ts' />

/// <reference path='../../../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/Repository.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/factory/ObjectFactory.ts' />

module test {
	export module helper {
		export class DummyRepository extends app.domain.repository.core.Repository<test.helper.Dummy> {
			constructor(httpService) {
				super(httpService);
				this.type = test.helper.Dummy;
				this.resources = {
					'all': '/data/api/dummy/list.json'
				};
			}
		}
	}
}

module test.domain.repository {
	export function RepositoryTest() {
		describe("Repository class suite", function() {

			it("create a 'Dummy' object from JSON", function() {
				var dummy: test.helper.Dummy = new test.helper.Dummy("dummy1");
				var data: any = { "id": dummy.id, "name": "dummy1" };

				expect(app.domain.factory.ObjectFactory.createFromJson(test.helper.Dummy,data)).toEqual(dummy);
			});

			it("get Dummies using repository.findAll()",angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.when("GET", '/data/api/dummy/list.json').respond({
					"items": [
						{ "id": 1, "name": "DummyObject1" },
						{ "id": 2, "name": "DummyObject2" }
					]
				});
				var repository: test.helper.DummyRepository = new test.helper.DummyRepository($http);
				var dummies: test.helper.Dummy[];

				repository.findAll(function(items: test.helper.Dummy[]) {
					dummies = items;
				});
				$httpBackend.flush();
				expect(dummies).toEqual([test.helper.Dummy.createDummy(1,"DummyObject1"), test.helper.Dummy.createDummy(2,"DummyObject2")]);
			}));

			it("get Dummies using repository.findAll() with local caching",angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.expectGET('/data/api/dummy/list.json').respond({
					"items": [
						{ "id": 1, "name": "DummyObject1" },
						{ "id": 2, "name": "DummyObject2" }
					]
				});
				var repository: test.helper.DummyRepository = new test.helper.DummyRepository($http);
				var dummies: test.helper.Dummy[];

				repository.findAll(function(items: test.helper.Dummy[]) {
					dummies = items;
				});
				$httpBackend.flush();
				expect(dummies).toEqual([test.helper.Dummy.createDummy(1,"DummyObject1"), test.helper.Dummy.createDummy(2,"DummyObject2")]);


				var dummies2: test.helper.Dummy[];
				repository.findAll(function(items: test.helper.Dummy[]) {
					dummies2 = items;
				}, true);

				$httpBackend.verifyNoOutstandingRequest();
				expect(dummies2).toEqual([test.helper.Dummy.createDummy(1,"DummyObject1"), test.helper.Dummy.createDummy(2,"DummyObject2")]);


				$httpBackend.resetExpectations();
				$httpBackend.expectGET('/data/api/dummy/list.json').respond({
					"items": [
						{ "id": 4564565, "name": "Dummy of Donald Duck" },
						{ "id": 8875346, "name": "Dummy of Dagobert Duck" },
						{ "id": 223325, "name": "Dummy of Daisy Duck" }
					]
				});

				var duckDummies: test.helper.Dummy[];
				repository.findAll(function(items: test.helper.Dummy[]) {
					duckDummies = items;
				});

				$httpBackend.flush();

				expect(duckDummies).toEqual([
					test.helper.Dummy.createDummy(4564565,"Dummy of Donald Duck"),
					test.helper.Dummy.createDummy(8875346,"Dummy of Dagobert Duck"),
					test.helper.Dummy.createDummy(223325,"Dummy of Daisy Duck")
				]);
			}));

			it("get Dummy using repository.findOneBy()",angular.mock.inject(function($httpBackend, $http) {
				// Crappy passThrough() not working :-(
				$httpBackend.when("GET", '/data/api/dummy/list.json').respond({
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
				var repository: test.helper.DummyRepository = new test.helper.DummyRepository($http);
				var dummy: test.helper.Dummy;

				repository.findOneBy('name', "DummyObject2", function(item: test.helper.Dummy) {
					dummy = item;
				});
				$httpBackend.flush();
				expect(dummy).toEqual(test.helper.Dummy.createDummy(2,"DummyObject2"));
			}));

			it("using alternative items property name for data",angular.mock.inject(function($httpBackend, $http) {
				// Crappy passThrough() not working :-(
				$httpBackend.when("GET", '/data/api/dummy/list.json').respond({
					"dummies": [
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
				var repository: test.helper.DummyRepository = new test.helper.DummyRepository($http);
				repository.dataList = 'dummies';
				var dummies: test.helper.Dummy[];

				repository.findAll(function(items: test.helper.Dummy[]) {
					dummies = items;
				});
				$httpBackend.flush();
				expect(dummies).toEqual([test.helper.Dummy.createDummy(1,"DummyObject1"), test.helper.Dummy.createDummy(2,"DummyObject2")]);
			}));

			it("filter loaded data",angular.mock.inject(function($httpBackend, $http) {
				// Crappy passThrough() not working :-(
				$httpBackend.when("GET", '/data/api/dummy/list.json').respond({
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
				var repository: test.helper.DummyRepository = new test.helper.DummyRepository($http);
				repository.filter = function(element) { return element.id == 2; };
				var dummies: test.helper.Dummy[];

				repository.findAll(function(items: test.helper.Dummy[]) {
					dummies = items;
				});
				$httpBackend.flush();
				expect(dummies).toEqual([test.helper.Dummy.createDummy(2,"DummyObject2")]);
			}));

			it("remote host call",angular.mock.inject(function($httpBackend, $http) {
				// Crappy passThrough() not working :-(
				$httpBackend.when("GET", 'http://www.eeppi.ch/data/api/dummy/list.json').respond({
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
				var repository: test.helper.DummyRepository = new test.helper.DummyRepository($http);
				repository.host = 'http://www.eeppi.ch';
				var dummies: test.helper.Dummy[];

				repository.findAll(function(items: test.helper.Dummy[]) {
					dummies = items;
				});
				$httpBackend.flush();
				expect(dummies).toEqual([test.helper.Dummy.createDummy(1,"DummyObject1"), test.helper.Dummy.createDummy(2,"DummyObject2")]);
			}));

			it("remote host call unsing local proxy",angular.mock.inject(function($httpBackend, $http) {
				// Crappy passThrough() not working :-(
				var url = '/dks/getFromDKS?url='+encodeURIComponent('http://www.eeppi.ch/data/api/dummy/list.json');
				$httpBackend.when("GET", url).respond({
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
				var repository: test.helper.DummyRepository = new test.helper.DummyRepository($http);
				repository.host = 'http://www.eeppi.ch';
				repository.proxy = '/dks/getFromDKS?url={target}';
				var dummies: test.helper.Dummy[];

				repository.findAll(function(items: test.helper.Dummy[]) {
					dummies = items;
				});
				$httpBackend.flush();
				expect(dummies).toEqual([test.helper.Dummy.createDummy(1,"DummyObject1"), test.helper.Dummy.createDummy(2,"DummyObject2")]);
			}));
		});
	}
}
