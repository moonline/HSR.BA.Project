module app.service {
	export class ProcessorProcesser {

		private data: Object;
		private template: string;
		private processorPattern = /\$\w*\:\(\w*\)\$/igm;
		private processorNamePattern = /\$\w*\:\(/igm;
		private processorParameterPattern = /\:\(\w*\)\$/igm;
		private processors: { [index:string]: any };

		constructor(data: Object, template: string, processors: { [index:string]: any }) {
			this.template = template;
			this.data = data;
			this.processors = processors;
		}

		public process(): string {
			var template = this.template;
			// $processorname:(param1, param2)$
			for(var match; match = this.processorPattern.exec(template); ) {
				var processorLiteral: string = match[0];
				var index: number = match.index;
				var replaceLength:number = match[0].length;

				var processorName: string = this.getProcessorName(processorLiteral);
				var processorParameters: string[] = this.getParameters(processorLiteral);

				var processorReplacement = this.runProcessor(processorName, processorParameters);
				template = template.slice(0, index) + processorReplacement + template.slice(index+replaceLength, template.length);
			}
			return template;
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
			var processorNamePart:string = this.processorNamePattern.exec(processorLiteral)[0];
			return processorNamePart.substring(1, processorNamePart.length-2);
		}

		private getParameters(processorLiteral: string):string[] {
			var processorParameterPart: string = this.processorParameterPattern.exec(processorLiteral)[0];
			var parameters: string[] = (processorParameterPart.substring(2, processorParameterPart.length-2)).split(',');
			for(var pi in parameters) {
				parameters[pi] = parameters[pi].trim();
			}
			return parameters;
		}
	}
}