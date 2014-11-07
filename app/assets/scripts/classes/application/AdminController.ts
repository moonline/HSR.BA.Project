module app.application {
	'use strict';

	export class AdminController {
		$scope: any;
		authenticationService: app.service.AuthenticationService;

		constructor($scope, $location, $http, authenticationService) {

		}
	}
}