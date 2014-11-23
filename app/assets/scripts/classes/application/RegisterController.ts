/// <reference path='../domain/model/User.ts' />
/// <reference path='../service/AuthenticationService.ts' />
/// <reference path='../domain/model/PPTAccount.ts' />

/// <reference path='../application/ApplicationState.ts' />

module app.application {
	'use strict';

	export enum Status {
		success, error
	}

	export class RegisterController {
		$scope: any;
		authenticationService: app.service.AuthenticationService;

		constructor($scope, $location, $http, persistenceService, authenticationService) {
			this.$scope = $scope;
			this.authenticationService = authenticationService;
			$scope.operationState = app.application.ApplicationState.waiting;

			var pptAccountRepository = persistenceService['pptAccountRepository'];
			var projectPlanningToolRepository = persistenceService['projectPlanningToolRepository'];

			$scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 4 seconds
				if ($scope.operationState == app.application.ApplicationState.pending) {
					$scope.operationState = app.application.ApplicationState.failed;
					$scope.$apply();
				}
			}, 4000);
			projectPlanningToolRepository.findAll(function (success, ppts) {
				$scope.projectPlanningTools = ppts;

				// prevent request mix of angular -> call sync instead of parallel async
				pptAccountRepository.findAll(function (success, pptAccounts) {
					$scope.pptAccounts = pptAccounts;

					setTimeout(() => {
						$scope.operationState = app.application.ApplicationState.successful;
						$scope.$apply();
					}, configuration.settings.messageBoxDelay);
				});
			});

			// make Status available in view
			$scope.Status = app.application.Status;

			$scope.authenticator = authenticationService;
			$scope.$watch('authenticator', function() {});

			$scope.passwordChangeStatus = null;

			$scope.registerStatus = null;

			$scope.pptAccountStatus = null;

			$scope.changePassword = function(oldPassword, newPassword, newPasswordRepeat) {
				$scope.passwordChangeStatus = null;
				this.authenticationService.changePassword(oldPassword, newPassword, newPasswordRepeat, function(success: boolean) {
					if(success) {
						$scope.passwordChangeStatus = app.application.Status.success;
					} else {
						$scope.passwordChangeStatus = app.application.Status.error;
					}
				});
			}.bind(this);

            $scope.register = function(username, password, passwordRepeat) {
				this.authenticationService.register(username, password, passwordRepeat, function(success: boolean) {
					if(success) {
						$scope.registerStatus = app.application.Status.success;
					} else {
						$scope.registerStatus = app.application.Status.error;
					}
				});
			}.bind(this);

			$scope.logoff = function() {
				this.authenticationService.logout(function(success: boolean) {
				});
			}.bind(this);


			/* ppt accounts */
			$scope.createPPTAccount = function (pptUrl:string, userName:string, password:string, ppt:app.domain.model.ppt.ProjectPlanningTool) {
				var pptAccount:app.domain.model.ppt.PPTAccount = new app.domain.model.ppt.PPTAccount(
					authenticationService.currentUser, userName, pptUrl, ppt
				);
				pptAccount.pptPassword = password;
				$scope.operationState = app.application.ApplicationState.saving;
				pptAccountRepository.add(pptAccount, function (success:boolean, item:app.domain.model.ppt.PPTAccount) {
					$scope.setOperationFinishState(success);
				});
			};

			$scope.updatePPTAccount = function (pptAccount:app.domain.model.ppt.PPTAccount) {
				if($scope.hasPPTAccountChanged) {
					$scope.hasPPTAccountChanged = false;
					$scope.operationState = app.application.ApplicationState.saving;
					pptAccountRepository.update(pptAccount, function (success, item) {
						$scope.setOperationFinishState(success);
					});
				}
			};

			$scope.hasPPTAccountChanged = false;

			$scope.pptAccountChanged = function() {
				$scope.hasPPTAccountChanged = true;
			};

			$scope.removePPTAccount = function (pptAccount:app.domain.model.ppt.PPTAccount) {
				$scope.operationState = app.application.ApplicationState.saving;
				pptAccountRepository.remove(pptAccount, function (success) {
					$scope.setOperationFinishState(success);
				});
			};

			$scope.showSelectedPPTAccount = function (toUpdatePPTAccount:app.domain.model.ppt.PPTAccount) {
				toUpdatePPTAccount.ppt = $scope.findPPTInList(toUpdatePPTAccount.ppt);
			};

			//Finds the correct object instance for the given PPT to select it in the list
			$scope.findPPTInList = function (expectedPPT:app.domain.model.ppt.ProjectPlanningTool) {
				for (var index = 0; index < $scope.projectPlanningTools.length; ++index) {
					if ($scope.projectPlanningTools[index].id == expectedPPT.id) {
						return $scope.projectPlanningTools[index];
					}
				}
				return expectedPPT;
			};

			$scope.setOperationFinishState = function (success:boolean) {
				if (success) {
					setTimeout(() => {
						$scope.operationState = app.application.ApplicationState.successful;
						$scope.$apply();
					}, configuration.settings.messageBoxDelay);
				} else {
					setTimeout(() => {
						$scope.operationState = app.application.ApplicationState.failed;
						$scope.$apply();
					}, configuration.settings.messageBoxDelay);
				}
			};

		}
	}
}