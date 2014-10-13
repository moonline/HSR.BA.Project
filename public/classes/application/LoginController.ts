/// <reference path='../../classes/domain/model/User.ts' />

module core {
	'use strict';

	export class LoginController {
		$scope: any;

		/**
		 * @inject
		 */
		public static $inject: string[] = [
			'$scope',
			'$location'
		];

		constructor($scope, $location, $http, persistenceService, userManagementService) {
			var loginUrl: string = '/user/login';
            var registerUrl: string = '/user/register';
			var loginStatusUrl: string = '/user/login-status';
			var logoutUrl: string = '/user/logout';

			this.$scope = $scope;
			$scope.loggedInUser = userManagementService.loggedInUser;

			$scope.loginUserName = "";
			$scope.loginPassword = "";
            $scope.loginStatus = (userManagementService.loggedInUser instanceof User) ? "loggedIn": "loggedOff";

			$http.get(loginStatusUrl).success(function(data) {
				if(data.is_logged_in === true) {
					var user: User = new User(data.name);
					$scope.loggedInUser = user;
					userManagementService.loggedInUser = user;
					$scope.loginStatus = "loggedIn";
				}
			});

            $scope.registerUserName = "";
            $scope.registerPassword = "";
            $scope.registerPasswordRepeat = "";
            $scope.registerStatus = null;

			$scope.signIn = function() {
				$http.post(
					loginUrl,
					{ "name": $scope.loginUserName, "password": $scope.loginPassword }
				).success(function(data, status, headers, config) {
					$scope.loggedInUser = new User($scope.loginUserName);
					userManagementService.loggedInUser = $scope.loggedInUser;
					$scope.loginUserName = "";
					$scope.loginPassword = "";
					$scope.loginStatus = "loggedIn";
				}).error(function(data, status, headers, config) {
					console.log(data, status, headers, config);

					$scope.loginStatus = "loginError";
				});
			};

            $scope.register = function() {
                $http.post(
                    registerUrl,
                    { "name": $scope.registerUserName, "password": $scope.registerPassword, "password_repeat": $scope.registerPasswordRepeat }
                ).success(function(data, status, headers, config) {
                    $scope.registerUserName = "";
                    $scope.registerPassword = "";
                    $scope.registerPasswordRepeat = "";
                    $scope.registerStatus = "successFullRegistered";
                }).error(function(data, status, headers, config) {
                    console.log(data, status, headers, config);

                    $scope.registerStatus = "registerError";
                    $scope.registerPassword = "";
                    $scope.registerPasswordRepeat = "";
                });
            };

			$scope.logoff = function() {
				$http.post(logoutUrl, {}).success(function(data){
					userManagementService.loggedInUser = null;
					$scope.loggedInUser = null;
					$scope.loginStatus = "loggedOff";
				});
			}
		}
	}
}