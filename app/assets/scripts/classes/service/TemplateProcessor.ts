module app.service {
	export class ProcessorPattern {
		pattern: string;
		name: {
			pattern: string;
			// # characters in front of processor name
			preSignLength: number;
			// # characters behind of processor name
			postSignLength: number;
		};
		parameter: {
			pattern: string;
			// # characters in front of processor parameters
			preSignLength: number;
			// # characters behind of processor name
			postSignLength: number;
		}
	}
	export class VariablePattern {
		pattern: string;
		// # characters in front of variable name
		preSignLength: number;
		// # characters behind of variable name
		postSignLength: number;

	}


	export class TemplateProcessor {

		private data: Object;
		private template: string;

		/**
		 * @example:
		 *	 ${path.to.something}
		 *	 ${variable}
		 */
		primaryVariablePattern: VariablePattern = {
			pattern: '\\$\\{[\\w\\d\\s\\.]*\\}',
			preSignLength: 2,
			postSignLength: 1

		};
		secondaryVariablePattern: VariablePattern = {
			pattern: '\\$\\!\\{[\\w\\d\\s\\.]*\\}',
			preSignLength: 3,
			postSignLength: 1

		};

		/**
		 * processor pattern:
		 * $processorName:(param1, param2)$
		 *
		 * not allowed inside processor: '$', ':(', ')$'
		 * escape , like \, inside values:
		 * $processorName:(param1, "stringParam\, with\, comma")$
		 *
		 * @example:
		 *	 $processor:(abc1, abc, "ef")$
		 *	 $processor:(path.to.variable, "ab")$
		 *	 $processor:(abc1)$
		 *	 $processor:(abc1 )$
		 *	 $processor:()$
		 */
		primaryProcessorPattern: ProcessorPattern = {
			pattern: '\\$[A-Za-z0-9_-]+:\\([^\\(\\)]*\\)\\$',
			name: {
				pattern: '\\$[A-Za-z0-9_-]+:\\(',
				preSignLength: 1,
				postSignLength: 2
			},
			parameter: {
				pattern: ':\\([^\\(\\)]*\\)\\$',
				preSignLength: 2,
				postSignLength: 2
			}
		};
		secondaryProcessorPattern: ProcessorPattern = {
			pattern: '\\$\\![A-Za-z0-9_-]+:\\([^\\(\\)]*\\)\\$',
			name: {
				pattern: '\\$\\![A-Za-z0-9_-]+:\\(',
				preSignLength: 2,
				postSignLength: 2
			},
			parameter: {
				pattern: ':\\([^\\(\\)]*\\)\\$',
				preSignLength: 2,
				postSignLength: 2
			}
		};

		private processors: { [index:string]: any };

		/**
		 * @param {object} data - A dictionary used by variables and processors for template rendering
		 * @param {string} template - A text template containing markers and processors to replace
		 * @param {Object.<string, function>} processors - A dictionary with processor functions
		 */
		constructor(data: Object, template: string, processors: { [index:string]: any }) {
			this.template = template;
			this.data = data;
			this.processors = processors;
		}

		/**
		 * process member template using member data and member processors
		 *
		 * @returns {string} template - The rendered text template
		 */
		public process(): string {
			var template = this.template;

			template = this.parseVariables(this.primaryVariablePattern, template);
			template = this.parseProcessors(
				template,
				this.primaryProcessorPattern,
				function(processorName, processorParameters, startIndex, length) {
					return this.runProcessor(processorName, processorParameters);
				}.bind(this)
			);
			return template;
		}


		public processSecondary(): string {
			var template = this.template;
			// $!{variable.path.to.something}
			template = this.parseVariables(this.secondaryVariablePattern, template);
			// $!processorname:(param1, param2)$
			template = this.parseProcessors(
				template,
				this.secondaryProcessorPattern,
				function(processorName, processorParameters, startIndex, length) {
					return this.runProcessor(processorName, processorParameters);
				}.bind(this)
			);
			return template;
		}

		public parseProcessors(text: string, processorPattern: ProcessorPattern,
				executer: (processorName: string, processorParameters: string[], startIndex: number, length: number) => string):string {
			var regex: RegExp = new RegExp(processorPattern.pattern);
			var textToReplace = ""+text;

			for(var match; match = regex.exec(textToReplace); ) {
				var processorLiteral: string = match[0];
				var startIndex: number = match.index;
				var length: number = match[0].length;
				var name: string = this.getProcessorName(processorPattern, processorLiteral);
				var params: string[] = this.getProcessorParameters(processorPattern, processorLiteral);

				if(name && params && startIndex >= 0 && length > 0) {
					var replacement: string = executer(name, params, match.index, match[0].length);
					textToReplace = textToReplace.slice(0, startIndex) + (replacement || '') + textToReplace.slice(startIndex+length, textToReplace.length);
				} else {
					throw new Error("Invalid processor properties: "+JSON.stringify({
						match: match, name: name, params: params, startIndex: match.index, length: match[0].length
					}));
				}
			}
			return textToReplace;
		}

		/**
		 * Execute a processor
		 *
		 * @param {string} processorName
		 * @param {string[]} processorParameters - A list with string and path variables
		 * 		string variables: 	start and end with ", e.q. "\"a string value\"", "\"variable \, with escaped commas\""
		 * 		path variables: 	e.q. "path.to.variable"
		 * @returns {string} - The rendered processor or ""
		 *
		 * @example:
		 * 	runProcessor('concat', ["path.to.title", "\":\"", "path.to.value"]);
		 */
		public runProcessor(processorName: string, processorParameters: string[]):string {
			var parameterList: any[] = [];
			var instance = this;

			processorParameters.forEach(function(parameter){
				var param: any;
				if(instance.isStringParameter(parameter)) {
					param = parameter.substring(1,parameter.length-1) || '';
				} else {
					param = this.findValuesInPath(parameter, this.data);
				}
				parameterList.push(param);
			}.bind(this));

			if(this.processors[processorName]) {
				var method = this.processors[processorName];
				var result;
				try { // prevent malformed processors breake whole application
					result = method.apply(this,parameterList);
				} catch (error) {
					console.error("Execution of processor '"+processorName+"' failed. Please check your processor code.", error);
					throw new Error("Execution of processor '"+processorName+"' failed. Please check your processor code.");
				}
				return (result) ? result.toString() : '';
			} else {
				return '';
			}
		}

		private isStringParameter(variable: string) {
			return variable[0] == '"' && variable[variable.length-1] == '"';
		}

		/**
		 * Extract the processors name from the matched processor literal
		 *
		 * @param {ProcessorPattern} processorPattern
		 * @param {string} processorLiteral - E.g. $processor:(path.to.variable, "ab")$
		 * @returns {string}
		 */
		private getProcessorName(processorPattern: ProcessorPattern, processorLiteral: string) {
			var match;
			var processorNamePart:string = (match = (new RegExp(processorPattern.name.pattern)).exec(processorLiteral)) ? match[0] : null;
			if(processorNamePart) {
				// string pre- and post charachter to get the blank name
				return processorNamePart.substring(processorPattern.name.preSignLength, processorNamePart.length-processorPattern.name.postSignLength);
			} else {
				return null;
			}
		}

		/**
		 * Extract processor parameters from processor literal
		 *
		 * @param {ProcessorPattern} processorPattern
		 * @param {string} processorLiteral -  - E.g. $processor:(path.to.variable, "ab")$
		 * @returns {string[]} parameters - A list with string and path parameters, e.g. ["abc.ef", "\"string param\"", "variable"]
		 */
		private getProcessorParameters(processorPattern: ProcessorPattern, processorLiteral: string):string[] {
			var match;
			var processorParameterPart: string = (match = (new RegExp(processorPattern.parameter.pattern)).exec(processorLiteral)) ? match[0] : null;
			if(processorParameterPart) {
				var parameterCommaSepList:string = processorParameterPart.substring(processorPattern.parameter.preSignLength, processorParameterPart.length-processorPattern.parameter.postSignLength);
				if(parameterCommaSepList.length > 1) {
					// replace escaped commas before splitting and restore after
					parameterCommaSepList = parameterCommaSepList.split("\\,").join("##!!comma!!##");
					var parameters: string[] = parameterCommaSepList.split(',');
					for(var pi in parameters) {
						parameters[pi] = parameters[pi].split('##!!comma!!##').join(',');
					}
					return <string[]>parameters.map(function(element) { return element.trim(); });
				} else {
					return [];
				}
			} else {
				return [];
			}
		}

		/**
		 * find patterns like ${var} or ${var.auto.name} or $!{var}
		 *
		 * @param {VariablePattern} variablePattern
		 * @param {string} text - The template containing variable markers to replace
		 * @return {string} textToReplace - The template with replaced variable markers
		 */
		public parseVariables(variablePattern: VariablePattern, text: string):string {
			var regex: RegExp = new RegExp(variablePattern.pattern);
			var textToReplace = ""+text;

			for(var match; match = regex.exec(textToReplace); ) {
				var property: string = match[0].substring(variablePattern.preSignLength,match[0].length-variablePattern.postSignLength);
				var replaceLength:number = match[0].length;
				var index: number = match.index;

				var replacer: string = this.findValuesInPath(property,this.data);
				textToReplace = textToReplace.slice(0, index) + replacer + textToReplace.slice(index+replaceLength, textToReplace.length);
			}
			return textToReplace;
		}

		/**
		 * Split path variables by dots and follow the path inside data to find values
		 *
		 * @param {string} path - A path like 'taskTemplate.attributes.assignee'
		 * @param {object} data - Object with variables like { taskTemplate: { attributes: { assignee: 'admin', description: 'A description' } } }
		 * @returns {string} value - The found value or ""
		 */
		private findValuesInPath(path: string, data: Object): string {
			var currentSegment:string = null;
			var currentData = data;
			var propertyPathSegments = path.split('.');

			if(propertyPathSegments.length >= 1) {
				for(var si in propertyPathSegments) {
					currentSegment = propertyPathSegments[si];
					if(si == propertyPathSegments.length-1) {
						return (currentData && currentData[currentSegment] != undefined) ? <string>currentData[currentSegment] : "";
					} else {
						if(currentData && currentData[currentSegment]) {
							currentData = currentData[currentSegment];
						} else {
							return "";
						}
					}
				}
			}
			return "";
		}
	}
}