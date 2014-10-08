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
			$scope.data = '{\n\t"fields": {\n\t\t"project": {\n\t\t\t"key": "TEST"\n\t\t},\n\t\t"summary": "${summary}$",\n\t\t"description": "${description}$",\n\t\t"issuetype": {\n\t\t\t"name": "Bug"\n\t\t}\n\t}\n}';
		}
	}
}