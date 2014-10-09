/// <reference path='../../../resources/libraries/qUnit/qunit.d.ts' />
/// <reference path='../../../classes/domain/model/Option.ts' />

module test {
	export class OptionTest {
		public static run(): void {
			QUnit.test( "Option test", function( assert ) {
				OptionTest.testJsonImport(assert);
			});
		}

		public static testJsonImport(assert: any): void {
			var object: any = { "id": 2, "name": "ExtJS" };

			var option: dks.Option = new dks.Option("ExtJS");
			option.id = 2;

			assert.deepEqual(option, dks.Option.createFromJson(object));
		}
	}
}
