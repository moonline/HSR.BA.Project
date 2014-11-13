/// <reference path='../../../../public/test/includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/service/ProcessorProcesser.ts' />

module test.logic.service {
	export function ProcessorProcesserTest() {
		describe("Processor processer service test suite", function() {
			it("Simple processor", function() {
				var data: Object = {};
				var template:string = '';
				var processors: { [index:string]: any} = {
					simple: function() {
						return 'simpleStringReturn';
					},
					oneStringParam: function(param1) {
						return param1+'abc';
					}
				};

				var processorService: app.service.ProcessorProcesser = new app.service.ProcessorProcesser(data, template, processors);
				var result1: string = processorService.runProcessor('simple',[]);
				expect(result1).toEqual('simpleStringReturn');

				var result2: string = processorService.runProcessor('oneStringParam',['"irgendwas"']);
				expect(result2).toEqual('irgendwasabc');
			});
		});
	}
}