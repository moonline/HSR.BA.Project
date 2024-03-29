/// <reference path='../../../../public/test/includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/service/TemplateProcessor.ts' />

module test.logic.service {
	export function TemplateProcessorTest() {
		describe("Processor processer service test suite", function() {
			it("Parse simple processors", function() {
				var template: string = "{\
	\"assignee\": \"$simple:()$\",\
	\"name\": \"$simple:()$\"\
}";

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor({}, '', {});
				var processorData: any[] = [];
				processorService.parseProcessors(
					template,
					processorService.primaryProcessorPattern,
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

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor({}, '', {});
				var processorData: any[] = [];
				processorService.parseProcessors(
					template,
					processorService.primaryProcessorPattern,
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

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor({}, '', processors);
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

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, '', processors);
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

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, template, processors);
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

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, '', {});
				var renderedTemplate = processorService.parseVariables(processorService.primaryVariablePattern, template);
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

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, '', {});
				var renderedTemplate = processorService.parseVariables(processorService.primaryVariablePattern, template);
				var expectedTemplate: string = "{\
	\"assignee\": \"drei\",\
	\"name\": \"irgendwas: irgendwo\"\
}";
				expect(renderedTemplate).toEqual(expectedTemplate);
			});

			it("Render cascading variables with spaces", function(){
				var template: string = "{\
	\"name\": \"${var1.Title with Space}: ${var1.place.name}\"\
}";
				var data:any = {
					var1: {
						"Title with Space": 'irgendwas',
						place: {
							name: 'irgendwo'
						}
					}
				};

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, '', {});
				var renderedTemplate = processorService.parseVariables(processorService.primaryVariablePattern, template);
				var expectedTemplate: string = "{\
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

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, '', processors);
				var result1: string = processorService.runProcessor('receiverGenerator',['person1']);
				expect(result1).toEqual('Hans Müller <hmueller@gmx.net>');
			});

			it("Usage of escaped commas inside processor arguments", function() {
				var template = '$mapExistingAssignees:(taskTemplate.attributes.assignee, "Project Planner:admin\\,Customer:sandro\\,Architect:hans", "\\,", ":")$';
				var data:any = {
					taskTemplate: {
						attributes: {
							assignee: 'Customer'
						}
					}
				};
				var processors: { [index:string]: any} = {
					mapExistingAssignees: function(assignee, assignees, deli1, deli2) {
						var assigneeMappings = assignees.split(deli1);
						var assigneeList = {};
						assigneeMappings.forEach(function(assigneeMapping){
							var parts = assigneeMapping.split(deli2);
							assigneeList[parts[0]] = parts[1];
						});
						return assigneeList[assignee];
					}
				};

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, template, processors);
				var renderedTemplate = processorService.process();
				expect(renderedTemplate).toEqual('sandro');
			});

			it("Process template", function() {
				var template: string = "{\
	\"tula\": \"$concater:(var Mega1, \":\", Var 2)$\",\
	\"name\": \"$listConcater:(list,\"|\")$\",\
	$ifElse:(parentRequestData.issue.issue_id,\"\"parent_issue_id\": \"${parentRequestData.issue.issue_id}\"\\,\", \"\")$\
	\"iwo\": \"$concater:(var Mega1, \":\", Var 2)$\",\
	$mapExistingAssignees:(taskTemplate.assignee, \"Architect:bamboo|Project Manager:admin\", \"\"assignee\": \"${taskTemplate.assignee}\"\\,\")$\
	\"title\": \"${title.name it}\",\
	$ifElse:(var5, \"\"conditional\": \"${title.name it}\"\\,\", \"\")$\
	$ifElse:(title.name it, \"\"conditional2\": \"${title.name it}\"\\,\", \"\")$\
	\"stakeHolder\": \"$concater:(title.name it, \": \", ${Var a Name.path})$\"\
}";
				var data:any = {
					"var Mega1": 'irgendwas',
					"Var 2": 'nochwas',
					"Var a Name": {
						path: 'title.type'
					},
					title: {
						"name it": 'auto',
						type: 'gross'
					},
					list: [ 'eins', 'zwei', 'drei', 'vier'],
					taskTemplate: {
						assignee: 'Project Manager'
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
					},
					ifElse: function(condition, ifValue, elseValue) {
						if(condition && ifValue) {
							return ifValue;
						} else {
							return elseValue;
						}
					},
					mapExistingAssignees: function(assignee, existingAssignees, assigneeJSON) {
						if(assignee && existingAssignees && assigneeJSON) {
							var assigneeMappingList = existingAssignees.split("|");
							var assigneeMapping = {};
							for(var ami in assigneeMappingList) {
								var assigneeName = assigneeMappingList[ami].split(":")[0].trim();
								assigneeMapping[assigneeName] = assigneeMappingList[ami].split(":")[1].trim();
							}
							if(assigneeMapping[assignee]) {
								return assigneeJSON.replace(assignee, assigneeMapping[assignee]);
							} else {
								return "";
							}
						} else {
							return "";
						}
					}
				};

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, template, processors);
				var renderedTemplate = processorService.process();
				var expectedTemplate: string = "{\
	\"tula\": \"irgendwas:nochwas\",\
	\"name\": \"eins|zwei|drei|vier\",\
	\
	\"iwo\": \"irgendwas:nochwas\",\
	\"assignee\": \"admin\",\
	\"title\": \"auto\",\
	\
	\"conditional2\": \"auto\",\
	\"stakeHolder\": \"auto: gross\"\
}";

				expect(renderedTemplate).toEqual(expectedTemplate);
			});

			it("Process template 2 times using secondary variables & processors", function() {
				var template: string = "{\
	\"assignee\": \"$concater:(var1, \":\", var2)$\",\
	\"name\": \"$listConcater:(list,\"|\")$\",\
	\"assignee\": \"$concater:(var1, \":\", var2)$\",\
	\"title\": \"${title.name}\",\
	\"parent\": \"$!{lastRequestData.id}\",\
	\"parentKey\": \"$!concater:(lastRequestData.id, \"-\",lastRequestData.name)$\",\
	\"stakeHolder\": \"$concater:(title.name, \": \", ${varName.path})$\"\
}";
				var data:any = {
					var1: 'irgendwas',
					var2: 'nochwas',
					varName: {
						path: 'title.type'
					},
					title: {
						name: 'auto',
						type: 'gross'
					},
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

				var processorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(data, template, processors);
				var renderedTemplate = processorService.process();
				var expectedTemplate: string = "{\
	\"assignee\": \"irgendwas:nochwas\",\
	\"name\": \"eins|zwei|drei|vier\",\
	\"assignee\": \"irgendwas:nochwas\",\
	\"title\": \"auto\",\
	\"parent\": \"$!{lastRequestData.id}\",\
	\"parentKey\": \"$!concater:(lastRequestData.id, \"-\",lastRequestData.name)$\",\
	\"stakeHolder\": \"auto: gross\"\
}";

				expect(renderedTemplate).toEqual(expectedTemplate);

				var secondData = {
					lastRequestData: { id: 5, name: "Auto lila" }
				};

				var secondProcessorService: app.service.TemplateProcessor = new app.service.TemplateProcessor(secondData, expectedTemplate, processors);
				var renderedExportTemplate = secondProcessorService.processSecondary();
				var expectedExportTemplate: string = "{\
	\"assignee\": \"irgendwas:nochwas\",\
	\"name\": \"eins|zwei|drei|vier\",\
	\"assignee\": \"irgendwas:nochwas\",\
	\"title\": \"auto\",\
	\"parent\": \"5\",\
	\"parentKey\": \"5-Auto lila\",\
	\"stakeHolder\": \"auto: gross\"\
}";

				expect(renderedExportTemplate).toEqual(expectedExportTemplate);
			});
		});
	}
}