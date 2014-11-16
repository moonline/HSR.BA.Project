/// <reference path='../../../../public/test/includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/service/TemplateProcesser.ts' />

module test.logic.service {
	export function TemplateProcesserTest() {
		describe("Processor processer service test suite", function() {
			it("Parse simple processors", function() {
				var template: string = "{\
	\"assignee\": \"$simple:()$\",\
	\"name\": \"$simple:()$\"\
}";

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser({}, '', {});
				var processorData: any[] = [];
				processorService.parseProcessors(
					template,
					function(processorName, processorParameters, startIndex, length){
						processorData.push({
							processorName:processorName,
							processorParameters:processorParameters,
							startIndex:startIndex,
							length:length
						});
						return '';
					}
				);
				expect(processorData).toEqual([
					{
						processorName:'simple',
						processorParameters:[],
						startIndex:15,
						length:11
					},{
						processorName:'simple',
						processorParameters:[],
						startIndex:27,
						length:11
					}
				]);
			});

			it("Parse complex processors", function() {
				var template: string = "{\
	\"assignee\": \"$concater:(var1, \":\", var2)$\",\
	\"name\": \"$listConcater:(list,\"|\")$\"\
}";

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser({}, '', {});
				var processorData: any[] = [];
				processorService.parseProcessors(
					template,
					function(processorName, processorParameters, startIndex, length){
						processorData.push({
							processorName:processorName,
							processorParameters:processorParameters,
							startIndex:startIndex,
							length:length
						});
						return '';
					}
				);
				expect(processorData).toEqual([
					{
						processorName:'concater',
						processorParameters:['var1', '":"', 'var2'],
						startIndex:15,
						length:28
					},{
						processorName:'listConcater',
						processorParameters:['list', '"|"'],
						startIndex:27,
						length:25
					}
				]);
			});

			it("Simple processor", function() {
				var processors: { [index:string]: any} = {
					simple: function() {
						return 'simpleStringReturn';
					},
					oneStringParam: function(param1) {
						return param1+'abc';
					}
				};

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser({}, '', processors);
				var result1: string = processorService.runProcessor('simple',[]);
				expect(result1).toEqual('simpleStringReturn');

				var result2: string = processorService.runProcessor('oneStringParam',['"irgendwas"']);
				expect(result2).toEqual('irgendwasabc');
			});

			it("Variable processor", function() {
				var data:any = {
					var1: 'irgendwas',
					var2: 'nochwas',
					wortliste: [ 'eins', 'zwei', 'drei', 'vier']
				};
				var processors: { [index:string]: any} = {
					concater: function(text1, text2, text3) {
						return text1+text2+text3;
					},
					listConcater: function(list, gap) {
						var result: string = '';
						for(var li in list) {
							result += (li < list.length-1) ? list[li].toString()+gap : list[li].toString();
						}
						return result;
					}
				};

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser(data, '', processors);
				var result1: string = processorService.runProcessor('concater',['var1', '":"', 'var2']);
				expect(result1).toEqual('irgendwas:nochwas');

				var result2: string = processorService.runProcessor('listConcater',['wortliste','"|"']);
				expect(result2).toEqual('eins|zwei|drei|vier');
			});

			it("Process complex template with processors and path variables", function() {
				var template: string = "{\
	\"assignee\": \"$concater:(var1.title, \"-\", var1.object.name)$\",\
	\"values\": \"$listConcater:(var2.list,\"|\")$\"\
}";
				var data:any = {
					var1: {
						title: 'irgendwer',
						object: {
							name: 'irgendwo'
						}
					},
					var2: {
						list: [ 'eins', 'zwei', 'drei', 'vier']
					}
				};
				var processors: { [index:string]: any} = {
					concater: function(text1, text2, text3) {
						return text1+text2+text3;
					},
					listConcater: function(list, gap) {
						var result: string = '';
						for(var li in list) {
							result += (li < list.length-1) ? list[li].toString()+gap : list[li].toString();
						}
						return result;
					}
				};

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser(data, template, processors);
				var result1: string = processorService.process();

				var expectedTemplate: string = "{\
	\"assignee\": \"irgendwer-irgendwo\",\
	\"values\": \"eins|zwei|drei|vier\"\
}";
				expect(result1).toEqual(expectedTemplate);
			});

			it("Render variables", function(){
				var template: string = "{\
	\"assignee\": \"${var1}\",\
	\"name\": \"${var1} und ${var2}\"\
}";
				var data:any = {
					var1: 'irgendwas',
					var2: 'nochwas',
					list: [ 'eins', 'zwei', 'drei', 'vier']
				};

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser(data, '', {});
				var renderedTemplate = processorService.parseVariables(template);
				var expectedTemplate: string = "{\
	\"assignee\": \"irgendwas\",\
	\"name\": \"irgendwas und nochwas\"\
}";
				expect(renderedTemplate).toEqual(expectedTemplate);
			});

			it("Render cascading variables", function(){
				var template: string = "{\
	\"assignee\": \"${list.2}\",\
	\"name\": \"${var1.titel}: ${var1.place.name}\"\
}";
				var data:any = {
					var1: {
						titel: 'irgendwas',
						place: {
							name: 'irgendwo'
						}
					},
					list: [ 'eins', 'zwei', 'drei', 'vier']
				};

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser(data, '', {});
				var renderedTemplate = processorService.parseVariables(template);
				var expectedTemplate: string = "{\
	\"assignee\": \"drei\",\
	\"name\": \"irgendwas: irgendwo\"\
}";
				expect(renderedTemplate).toEqual(expectedTemplate);
			});

			it("Complex object processor", function() {
				var data:any = {
					person1: { name: 'Hans Müller', email: 'hmueller@gmx.net' }
				};
				var processors: { [index:string]: any} = {
					receiverGenerator: function(person) {
						return person.name+' <'+person.email+'>';
					}
				};

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser(data, '', processors);
				var result1: string = processorService.runProcessor('receiverGenerator',['person1']);
				expect(result1).toEqual('Hans Müller <hmueller@gmx.net>');
			});

			it("Process template", function() {
				var template: string = "{\
	\"assignee\": \"$concater:(var1, \":\", var2)$\",\
	\"name\": \"$listConcater:(list,\"|\")$\",\
	\"assignee\": \"$concater:(var1, \":\", var2)$\"\
}";
				var data:any = {
					var1: 'irgendwas',
					var2: 'nochwas',
					list: [ 'eins', 'zwei', 'drei', 'vier']
				};
				var processors: { [index:string]: any} = {
					concater: function(text1, text2, text3) {
						return text1+text2+text3;
					},
					listConcater: function(list, gap) {
						var result: string = '';
						for(var li in list) {
							result += (li < list.length-1) ? list[li].toString()+gap : list[li].toString();
						}
						return result;
					}
				};

				var processorService: app.service.TemplateProcesser = new app.service.TemplateProcesser(data, template, processors);
				var renderedTemplate = processorService.process();
				var expectedTemplate: string = "{\
	\"assignee\": \"irgendwas:nochwas\",\
	\"name\": \"eins|zwei|drei|vier\",\
	\"assignee\": \"irgendwas:nochwas\"\
}";

				expect(renderedTemplate).toEqual(expectedTemplate);
			});
		});
	}
}