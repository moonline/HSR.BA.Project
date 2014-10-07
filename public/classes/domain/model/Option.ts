module dks {
	export class Option {
		// TODO: replace this ugly hack. This is only for first json import
		public static createFromJson(object: any): Option {
			var domainObject = new Option(object.name);
			domainObject.id = object.id;

			return domainObject;
		}

		public id: number;
		public name: string;

		constructor(name: string) { this.name = name; }
	}
}