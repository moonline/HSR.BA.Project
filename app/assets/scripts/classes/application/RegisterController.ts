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

			$scope.loginUserName = "";
			$scope.loginPassword = "";

            $scope.registerUserName = "";
            $scope.registerPassword = "";
            $scope.registerPasswordRepeat = "";

			$scope.signIn = function() {
				this.authenticationService.login($scope.loginUserName, $scope.loginPassword, function(success: boolean, user: User) {
					if(success) {
						$scope.loginUserName = "";
						$scope.loginPassword = "";
					} else {
						alert("Login error. Username or password incorrect.");
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
						alert("Registration error. User already exists or passwort repetation incorrect.");
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