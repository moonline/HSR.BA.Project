/// <reference path='Option.ts' />
/// <reference path='../../domain/model/Node.ts' />
/// <reference path='../../domain/repository/PersistentEntity.ts' />

module dks {
	export class Decision implements dks.Node, core.PersistentEntity {
		// TODO: replace this ugly hack. This is only for first json import
		public static createFromJson(object: any): Decision {
			var domainObject: Decision = new Decision(object.name, object.options);
			domainObject.id = object.id;
			domainObject.choosenOption = object.choosenOption;

			domainObject.options.forEach(function(element){
				element = Option.createFromJson(element);
			});
			return domainObject;
		}

		public id: number;
		public name: string;
		private choosenOption: number; // TODO: replace by reference
		public options: Option[];

		constructor(name: string, options: Option[] = []) {
			this.id = Math.round(Math.random()*1000000);
			this.name = name;
			this. options = options;
		}
	}
}