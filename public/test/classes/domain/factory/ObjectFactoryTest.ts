/// <reference path='../../../includes.ts' />

/// <reference path='../../../../../app/assets/scripts/classes/domain/factory/ObjectFactory.ts' />

module test {
	export module helper {
	}
}
module test.domain.factory {
	export function ObjectFactoryTest() {
		describe("ObjectFactory class suite", function() {

			it("create simple object from json", function(){
				var dummyData = { "id": 5, "name": "DummyObject" };
				var dummyObject = test.helper.Dummy.createDummy(5,"DummyObject");

				expect(app.domain.factory.ObjectFactory.createFromJson(test.helper.Dummy,dummyData)).toEqual(dummyObject);
			});

			it("throw error on object without factory configuration", function() {
				var testObjectData: any = { "id": 5, "name": "peter" };

				expect(function() { app.domain.factory.ObjectFactory.createFromJson(test.helper.CLO,testObjectData); }).
					toThrow(new Error("No factory configuration defined for entity!"));
			});

			it("don't overwrite property with not found data", function(){
				var dummyData = { "name": "DummyObject" };
				var dummyObject = test.helper.Dummy.createDummy(5,"DummyObject");

				expect(typeof app.domain.factory.ObjectFactory.createFromJson(test.helper.Dummy,dummyData).id).toEqual("number");
			});

			it("create complex object from json", function() {
				var dummyData: any = {
					"id": 1234,
					"size": 2,
					"data": { a: 1, b: 2 },
					"dummies": [{ "id": 5, "name": "DummyObject1" },{ "id": 5, "name": "DummyObject2" }],
					"labels": ["dummy", "object", "do"]
				};
				var dummyContainer: test.helper.DummyContainer = test.helper.DummyContainer.create(
					dummyData.id,
					[
						helper.Dummy.createDummy(dummyData.dummies[0]['id'], dummyData.dummies[0]['name']),
						helper.Dummy.createDummy(dummyData.dummies[1]['id'], dummyData.dummies[1]['name'])
					],
					dummyData.labels,
					dummyData.data
				);

				expect(app.domain.factory.ObjectFactory.createFromJson(test.helper.DummyContainer, dummyData)).toEqual(dummyContainer);
			});

		});
	}
}
