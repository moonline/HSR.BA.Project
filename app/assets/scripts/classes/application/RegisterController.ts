/// <reference path='../domain/model/User.ts' />
/// <reference path='../service/AuthenticationService.ts' />

module core {
	'use strict';

	export class RegisterController {
		$scope: any;
		authenticationService: AuthenticationService;

		constructor($scope, $location, $http, authenticationService) {
			this.$scope = $scope;
			this.authenticationService = authenticationService;
			$scope.authenticator = authenticationService;
			$scope.$watch('authenticator', function() {});

			$scope.oldPassword = "";
			$scope.newPassword = "";
			$scope.newPasswordRepeat = "";

            $scope.registerUserName = "";
            $scope.registerPassword = "";
            $scope.registerPasswordRepeat = "";

			$scope.changePassword = function(oldPassword, newPassword, newPasswordRepeat) {
				this.authenticationService.changePassword(oldPassword, newPassword, newPasswordRepeat, function(success: boolean) {
					if(success) {
						$scope.oldPassword = "";
						$scope.newPassword = "";
						$scope.newPasswordRepeat = "";
					} else {
						alert("Password change error. Old password wrong or password repetition incorrect.");
					}
				});
			}.bind(this);

            $scope.register = function() {
				this.authenticationService.register($scope.registerUserName, $scope.registerPassword, $scope.registerPasswordRepeat, function(success: boolean) {
					if(success) {
						$scope.registerUserName = "";
						$scope.registerPassword = "";
						$scope.registerPasswordRepeat = "";
					} else {
						$scope.registerPassword = "";
						$scope.registerPasswordRepeat = "";
						alert("Registration error. User already exists or password repetition incorrect.");
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