module app.service {
	export class TemplateProcesser {

		private data: Object;
		private template: string;
		/**
		 * @example:
		 *	 $processor:(abc1, abc, "ef")$
		 *	 $processor:(abc1)$
		 *	 $processor:(abc1 )$
		 *	 $processor:()$
		 */
		private variablePattern:string = '\\$\\{[\\w\\d\\.]*\\}';
		private processorPattern:string = '\\$\\w+:\\([^\\(\\)]*\\)\\$';
		private processorNamePattern:string = '\\$\\w+:\\(';
		private processorParameterPattern:string = ':\\([^\\(\\)]*\\)\\$';
		private processors: { [index:string]: any };

		constructor(data: Object, template: string, processors: { [index:string]: any }) {
			this.template = template;
			this.data = data;
			this.processors = processors;
		}

		public process(): string {
			var template = this.template;
			// ${variable.path.to.something}
			template = this.parseVariables(template);
			// $processorname:(param1, param2)$
			template = this.parseProcessors(
				template,
				function(processorName, processorParameters, startIndex, length) {
					return this.runProcessor(processorName, processorParameters);
				}.bind(this)
			);
			return template;
		}

		public parseProcessors(text: string, executer: (processorName: string, processorParameters: string[], startIndex: number, length: number) => string):string {
			var regex: RegExp = new RegExp(this.processorPattern);
			var textToReplace = ""+text;

			for(var match; match = regex.exec(textToReplace); ) {
				var processorLiteral: string = match[0];
				var startIndex: number = match.index;
				var length: number = match[0].length;
				var name: string = this.getProcessorName(processorLiteral);
				var params: string[] = this.getParameters(processorLiteral);

				if(name && params && startIndex && startIndex >= 0 && length > 0) {
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

		public runProcessor(processorName: string, processorParameters: string[]):string {
			var parameterList: any[] = [];
			processorParameters.forEach(function(parameter){
				var param: any;
				if(this.isStringParameter(parameter)) {
					param = parameter.substring(1,parameter.length-1) || null;
				} else {
					param = this.findValuesInPath(parameter, this.data);
				}
				parameterList.push(param);
			}.bind(this));

			if(this.processors[processorName]) {
				var method = this.processors[processorName];
				return (method.apply(this,parameterList)).toString();
			} else {
				return '';
			}
		}

		private isStringParameter(variable: string) {
			return variable[0] == '"' && variable[variable.length-1] == '"';
		}

		private getProcessorName(processorLiteral: string) {
			var match;
			var processorNamePart:string = (match = (new RegExp(this.processorNamePattern)).exec(processorLiteral)) ? match[0] : null;
			if(processorNamePart) {
				return processorNamePart.substring(1, processorNamePart.length-2);
			} else {
				return null;
			}
		}

		private getParameters(processorLiteral: string):string[] {
			var match;
			var processorParameterPart: string = (match = (new RegExp(this.processorParameterPattern)).exec(processorLiteral)) ? match[0] : null;
			if(processorParameterPart) {
				var parameterCommaSepList:string = processorParameterPart.substring(2, processorParameterPart.length-2);
				if(parameterCommaSepList.length > 1) {
					var parameters: string[] = parameterCommaSepList.split(',');
					return <string[]>parameters.map(function(element) { return element.trim(); });
				} else {
					return [];
				}
			} else {
				return [];
			}
		}

		/**
		 * find patterns like ${var} or ${var.auto.name}
		 */
		public parseVariables(text: string):string {
			var regex: RegExp = new RegExp(this.variablePattern);
			var textToReplace = ""+text;

			for(var match; match = regex.exec(textToReplace); ) {
				var property: string = match[0].substring(2,match[0].length-1);
				var replaceLength:number = match[0].length;
				var index: number = match.index;

				var replacer: string = this.findValuesInPath(property,this.data);
				textToReplace = textToReplace.slice(0, index) + replacer + textToReplace.slice(index+replaceLength, textToReplace.length);
			}
			return textToReplace;
		}

		private findValuesInPath(path: string, data: Object): string {
			var currentSegment:string = null;
			var currentData = data;
			var propertyPathSegments = path.split('.');

			if(propertyPathSegments.length >= 1) {
				for(var si in propertyPathSegments) {
					currentSegment = propertyPathSegments[si];
					if(si == propertyPathSegments.length-1) {
						return (currentData[currentSegment] != undefined) ? <string>currentData[currentSegment] : "";
					} else {
						currentData = (currentData[currentSegment] != undefined) ? currentData[currentSegment] : null;
					}
				}
			}
			return "";
		}
	}
}