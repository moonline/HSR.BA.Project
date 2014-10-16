
module core {
	export class Empty{} // used for createObject

	export class ObjectFactory {

		/**
		 * create an prototype-object from object data recursive
		 *
		 * @param type e.g. String, Number, Object, Array, YourPrototype, ...
		 * 	-> Own Prototypes must implement static property factoryConfiguration (core.FactoryConfiguration)
		 * @param data e.g. { "id": 5, "name": "DummyObject" }
		 * @returns {T}
		 */
		public static createFromJson<T>(type: any, data: any):T {
			if(type.factoryConfiguration) {
				var constructorArguments: any[] = [];
				type.factoryConfiguration.constructorArguments.forEach(function(argument){
					constructorArguments.push(ObjectFactory.createProperty(data[argument['name']], argument));
				});

				var domainObject:T = ObjectFactory.createObject<T>(type,constructorArguments);

				type.factoryConfiguration.publicProperties.forEach(function(property){
					domainObject[property['name']] = ObjectFactory.createProperty(data[property['name']], property);
				});

				return domainObject;
			} else {
				return null;
			}
		}

		/**
		 * create an object property from a data item
		 *
		 * @param dataItem e.g. "DummyObject1"
		 * @param property e.q. { name: "id", type: Number, subType: null }
		 * @returns {*}
		 */
		public static createProperty(dataItem, property): any {
			if(dataItem) {
				if(property['type'] ===  String ||
					property['type'] === Number ||
					property['type'] === Object) {
					return dataItem;

				} else if(property['type'] === Array && property['subType'] != null && typeof property['subType'] != "undefined") {
					var list = [];
					dataItem.forEach(function(listElement, index){
						list.push(ObjectFactory.createProperty(listElement, { name: index, type: property['subType'], subType: null}));
					});
					return list;
				} else {
					return ObjectFactory.createFromJson(property['type'],dataItem);
				}
			} else {
				return null;
			}
		}

		/**
		 * This is not nice but it's the only way it works.
		 * You can't user the type itself to instantiate an object body because
		 * maybe some undefined properties will fail on access, so use an empty dummy class
		 */
		public static createObject<T>(constructor, args):T {
			Empty.prototype = constructor.prototype;
			var x = new Empty();
			constructor.apply(x, args);
			return <T>x;
		}
	}
}