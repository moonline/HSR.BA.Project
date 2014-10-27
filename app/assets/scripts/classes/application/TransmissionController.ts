/// <reference path='../domain/model/TaskTemplate.ts' />
/// <reference path='../domain/model/Decision.ts' />
/// <reference path='../domain/model/Mapping.ts' />

/// <reference path='../domain/repository/MappingRepository.ts' />

module core {
	'use strict';

	export class TransmissionController {
		mappingRepository: core.MappingRepository;
		$scope: any;

		constructor($scope, $location, persistenceService, $http) {
			this.$scope = $scope;
			this.mappingRepository = persistenceService['mappingRepository'];
			this.mappingRepository.findAll(function(items) {
				$scope.mappings = items;
			});

			$scope.url = "http://localhost:9920/rest/api/2/issue/";
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
						}
						decisionTaskTemplates.push(textToReplace);
					});
					$scope.output.push(decisionTaskTemplates);
				});
			};

			$scope.transmit = function() {
				$scope.trasmitCount = 0;
				$scope.transmitSuccessfullCount = 0;
				$scope.output.forEach(function(decisionTemplates) {
					decisionTemplates.forEach(function(decisionTaskTemplate){
						$scope.trasmitCount++;
						$http.post($scope.url, decisionTaskTemplate).success(function() {
							$scope.transmitSuccessfullCount++;
						});
					});
				});
			};
		}
	}
}