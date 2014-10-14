/// <reference path='../domain/model/Decision.ts' />
/// <reference path='../domain/model/Option.ts' />

module core {
	'use strict';

	export class DecisionListController {

		/**
		 * @inject
		 */
		public static $inject: string[] = [
			'$scope',
			'$location'
		];

		constructor($scope, $location, persistenceService) {
			persistenceService['decisionRepository'].findAll(function(items) {
				$scope.decisions = items;
			});
		}
	}
}