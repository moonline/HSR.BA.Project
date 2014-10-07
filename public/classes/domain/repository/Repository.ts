module core {
	export class Repository<T> {
		// TypeScript generics does not allow to call a static method on type T, so we need the class as property
		type: any = null;

		httpService;
		resources: { [index: string]: string } = {};

		constructor(httpService) {
			this.httpService = httpService;
		}

		public findAll(callback: (items: T[]) => void): void {
			var type = this.type;
			this.httpService.get(this.resources['all']).success(function(data){
				var items: T[] = [];
				data.items.forEach(function(element){
					items.push(type.createFromJson(element));
				});
				callback(items);
			});
		}
	}
}