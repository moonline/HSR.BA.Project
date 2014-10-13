/// <reference path='../../classes/domain/model/User.ts' />
/// <reference path='../../classes/domain/repository/UserRepository.ts' />

module core {
	'use strict';

	export class LoginController {
		$scope: any;
		userRepository: UserRepository;

		/**
		 * @inject
		 */
		public static $inject: string[] = [
			'$scope',
			'$location'
		];

		constructor($scope, $location, $http, persistenceService, userManagementService) {
			this.userRepository = persistenceService['userRepository'];

			this.$scope = $scope;
			$scope.loggedInUser = userManagementService.loggedInUser;

			$scope.loginUserName = "";
			$scope.loginPassword = "";
            $scope.loginStatus = (userManagementService.loggedInUser instanceof User) ? "loggedIn": "loggedOff";


			this.userRepository.loginStatus(function(user: User) {
				if(user) {
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
				this.userRepository.login($scope.loginUserName, $scope.loginPassword, function(success: boolean, user: User) {
					if(success) {
						$scope.loggedInUser = user;
						userManagementService.loggedInUser = $scope.loggedInUser;
						$scope.loginUserName = "";
						$scope.loginPassword = "";
						$scope.loginStatus = "loggedIn";
					} else {
						$scope.loginStatus = "loginError";
					}
				});
			}.bind(this);

            $scope.register = function() {
				this.userRepository.register($scope.registerUserName, $scope.registerPassword, $scope.registerPasswordRepeat, function(success: boolean) {
					if(success) {
						$scope.registerUserName = "";
						$scope.registerPassword = "";
						$scope.registerPasswordRepeat = "";
						$scope.registerStatus = "successFullRegistered";
					} else {
						$scope.registerStatus = "registerError";
						$scope.registerPassword = "";
						$scope.registerPasswordRepeat = "";
					}
				});
			}.bind(this);

			$scope.logoff = function() {
				this.userRepository.logout(function(success: boolean) {
					if(success) {
						userManagementService.loggedInUser = null;
						$scope.loggedInUser = null;
						$scope.loginStatus = "loggedOff";
					}
				});
			}.bind(this);
		}
	}
}