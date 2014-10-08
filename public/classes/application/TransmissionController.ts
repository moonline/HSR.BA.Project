/// <reference path='../../classes/domain/model/TaskTemplate.ts' />
/// <reference path='../../classes/domain/model/Decision.ts' />
/// <reference path='../../classes/domain/model/Mapping.ts' />

/// <reference path='../../classes/domain/repository/MappingRepository.ts' />

module core {
	'use strict';

	export class TransmissionController {
		mappingRepository: core.MappingRepository;
		$scope: any;

		/**
		 * @inject
		 */
		public static $inject: string[] = [
			'$scope',
			'$location'
		];

		constructor($scope, $location, persistenceService) {
			this.$scope = $scope;
			this.mappingRepository = persistenceService['mappingRepository'];
			this.mappingRepository.findAll(function(items) {
				$scope.mappings = items;
			});

			$scope.url = "localhost:9920/";
			$scope.data = '{\n\t"fields": {\n\t\t"project": {\n\t\t\t"key": "TEST"\n\t\t},\n\t\t"assignee": "${assignee}",\n\t\t"description": "${description}",\n\t\t"issuetype": {\n\t\t\t"name": "${type}"\n\t\t}\n\t}\n}';
			$scope.output = [];

			$scope.render = function(text: string) {
				$scope.output = [];
				$scope.mappings.forEach(function(mapping){
					var decisionTaskTemplates = [];

					mapping.taskTemplates.forEach(function(taskTemplate){
						var propertyValues = taskTemplate.getPropertieValuesByProperty();
						console.log(propertyValues);
						var textToReplace = ""+text;

						var pattern = /\$\{\w*\}/igm;
						for(var match; match = pattern.exec(textToReplace); ) {
							var property: string = match[0].substring(2,match[0].length-1);
							var replaceLength:number = match[0].length;
							var index: number = match.index;
							var replacer:string = (propertyValues[property] != undefined) ? propertyValues[property].value : "";
							textToReplace = textToReplace.slice(0, index) + replacer + textToReplace.slice(index+replaceLength, textToReplace.length);

							console.log(match, property, index, replaceLength, replacer);
						}
						decisionTaskTemplates.push(textToReplace);
					});
					$scope.output.push(decisionTaskTemplates);
				});
			}
		}
	}
}