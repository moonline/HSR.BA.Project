/// <reference path='../../classes/domain/model/TaskTemplate.ts' />
/// <reference path='../../classes/domain/model/Decision.ts' />
/// <reference path='../../classes/domain/repository/TaskTemplateRepository.ts' />
/// <reference path='../../classes/domain/repository/DecisionRepository.ts' />
/// <reference path='../../classes/domain/repository/MappingRepository.ts' />

module core {
	'use strict';

	export class MappingController {
		taskTemplateRepository: core.TaskTemplateRepository;
		decisionRepository: dks.DecisionRepository;
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

			this.taskTemplateRepository = persistenceService['taskTemplateRepository'];
			this.decisionRepository = persistenceService['decisionRepository'];
			this.mappingRepository = persistenceService['mappingRepository'];

			this.taskTemplateRepository.findAll(function(items) {
				$scope.taskTemplates = items;
			});
			this.decisionRepository.findAll(function(items) {
				$scope.decisions = items;
			});
			this.update();

			$scope.newMapping = new Mapping(null,[]);
			$scope.create = function() {
				this.mappingRepository.add($scope.newMapping);
				$scope.newMapping = new Mapping(null,[]);
				this.update();
			}.bind(this);
		}

		private update(): void {
			this.mappingRepository.findAll(function(items) {
				this.$scope.mappings = items;
			}.bind(this));
		}
	}
}