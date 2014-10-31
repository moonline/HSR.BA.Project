/// <reference path='../domain/model/User.ts' />
/// <reference path='../service/AuthenticationService.ts' />

module app.application {
	'use strict';

	enum Status {
		success, error
	}

	export class RegisterController {
		$scope: any;
		authenticationService: app.service.AuthenticationService;

		constructor($scope, $location, $http, authenticationService) {
			this.$scope = $scope;
			this.authenticationService = authenticationService;

			$scope.Status = Status;
			$scope.authenticator = authenticationService;
			$scope.$watch('authenticator', function() {});

			$scope.passwordChangeStatus = null;

			$scope.registerStatus = null;

			$scope.changePassword = function(oldPassword, newPassword, newPasswordRepeat) {
				$scope.passwordChangeStatus = null;
				this.authenticationService.changePassword(oldPassword, newPassword, newPasswordRepeat, function(success: boolean) {
					if(success) {
						$scope.passwordChangeStatus = Status.success;
					} else {
						$scope.passwordChangeStatus = Status.error;
					}
				});
			}.bind(this);

            $scope.register = function(username, password, passwordRepeat) {
				this.authenticationService.register(username, password, passwordRepeat, function(success: boolean) {
					if(success) {
						$scope.registerStatus = Status.success;
					} else {
						$scope.registerStatus = Status.error;
					}
				});
			}.bind(this);

			$scope.logoff = function() {
				this.authenticationService.logout(function(success: boolean) {
				});
			}.bind(this);
		}
	}
}