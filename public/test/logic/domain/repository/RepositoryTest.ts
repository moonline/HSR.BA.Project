/// <reference path='../../../../../public/test/includes.ts' />

/// <reference path='../../../../../app/assets/scripts/classes/domain/model/Node.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/PersistentEntity.ts' />
/// <reference path='../../../../../app/assets/scripts/classes/domain/repository/Repository.ts' />

module test {
	export module helper {
		export class DummyRepository extends app.domain.repository.core.Repository<test.helper.Dummy> {
			constructor(httpService) {
				super(httpService);
				this.type = test.helper.Dummy;
				this.resources = {
					list: { method: 'GET', url: '/dummy' },
					create: { method: 'POST', url: '/dummy' }
				};
			}
		}
	}
}

module test.logic.domain.repository {
	export function RepositoryTest() {
		describe("Repository class suite", function() {

			it("get Dummies using repository.findAll()",angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.expectGET('/dummy').respond({
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
				$httpBackend.expectGET('/dummy').respond({
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
				$httpBackend.expectGET('/dummy').respond({
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
				$httpBackend.expectGET('/dummy').respond({
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
				$httpBackend.expectGET('/dummy').respond({
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
				$httpBackend.expectGET('/dummy').respond({
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
				$httpBackend.expectGET('http://www.eeppi.ch/dummy').respond({
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
				var url = '/dks/getFromDKS?url='+encodeURIComponent('http://www.eeppi.ch/dummy');
				$httpBackend.expectGET(url).respond({
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

			it("Add a dummy",angular.mock.inject(function($httpBackend, $http) {
				$httpBackend.expectPOST('/dummy').respond({
					"id":50, "name":"Dummy of Daisy Duck"
				});
				var repository: test.helper.DummyRepository = new test.helper.DummyRepository($http);
				var dummy = test.helper.Dummy.createDummy(null,"Dummy of Daisy Duck");

				var status;
				repository.add(dummy, function(state, item){ status = { status: state, dummy: item }; });

				$httpBackend.flush();
				expect(status.status).toEqual(true);
				expect(status.dummy).toEqual(test.helper.Dummy.createDummy(50,"Dummy of Daisy Duck"));
			}));
		});
	}
}