/// <reference path='../domain/model/User.ts' />
/// <reference path='../service/AuthenticationService.ts' />

module core {
	'use strict';

	enum Status {
		success, error
	}

	export class RegisterController {
		$scope: any;
		authenticationService: AuthenticationService;

		constructor($scope, $location, $http, authenticationService) {
			this.$scope = $scope;
			this.authenticationService = authenticationService;

			$scope.Status = Status;
			$scope.authenticator = authenticationService;
			$scope.$watch('authenticator', function() {});

			$scope.passwordChangeStatus = null;
			/*$scope.oldPassword = "";
			$scope.newPassword = "";
			$scope.newPasswordRepeat = "";*/

			$scope.registerStatus = null;
           /* $scope.registerUserName = "";
            $scope.registerPassword = "";
            $scope.registerPasswordRepeat = "";*/

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