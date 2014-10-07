/// <reference path='../../../classes/domain/model/Option.ts' />

module dks {
	export class Decision {
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

		private id: number;
		public name: string;
		private choosenOption: number; // TODO: replace by reference
		public options: Option[];

		constructor(name: string, options: Option[]) { this.name = name; this. options = options; }
	}
}