module app.service {
	export class ProcessorProcesser {

		private data: Object;
		private template: string;
		/**
		 * @example:
		 *	 $processor:(abc1, abc, "ef")$
		 *	 $processor:(abc1)$
		 *	 $processor:(abc1 )$
		 *	 $processor:()$
		 */
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

			for(var match; match = regex.exec(text); ) {
				console.log(JSON.stringify(regex.lastIndex));
				var processorLiteral: string = match[0];
				var startIndex: number = match.index;
				var length: number = match[0].length;
				var name: string = this.getProcessorName(processorLiteral);
				var params: string[] = this.getParameters(processorLiteral);

				if(name && params && startIndex && startIndex >= 0 && length > 0) {
					var replacement: string = executer(name, params, match.index, match[0].length);
					text = text.slice(0, startIndex) + (replacement || '') + text.slice(startIndex+length, text.length);
				} else {
					throw new Error("Invalid processor properties: "+JSON.stringify({
						match: match, name: name, params: params, startIndex: match.index, length: match[0].length
					}));
				}
			}
			return text;
		}

		public runProcessor(processorName: string, processorParameters: string[]):string {
			var parameterList: any[] = [];
			processorParameters.forEach(function(parameter){
				var param: any;
				if(this.isStringParameter(parameter)) {
					param = parameter.substring(1,parameter.length-1) || null;
				} else {
					param = this.data[parameter] || null;
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
	}
}