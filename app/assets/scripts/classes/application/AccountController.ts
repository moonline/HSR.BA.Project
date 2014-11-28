/// <reference path='../domain/model/User.ts' />
/// <reference path='../domain/model/PPTAccount.ts' />

/// <reference path='../domain/repository/PPTAccountRepository.ts' />
/// <reference path='../domain/repository/ProjectPlanningToolRepository.ts' />

/// <reference path='../application/ApplicationState.ts' />

/// <reference path='../service/AuthenticationService.ts' />

module app.application {
	'use strict';

	export enum Status {
		success, error
	}

	export class AccountController {
		scope: any;
		authenticationService: app.service.AuthenticationService;
		settings: any;
		
		pptAccountRepository: app.domain.repository.ppt.PPTAccountRepository;
		projectPlanningToolRepository: app.domain.repository.ppt.ProjectPlanningToolRepository;
		

		constructor($scope, persistenceService, authenticationService) {
			
			this.authenticationService = authenticationService;
			this.settings = configuration.settings;
			this.pptAccountRepository = persistenceService['pptAccountRepository'];
			this.projectPlanningToolRepository = persistenceService['projectPlanningToolRepository'];
			this.scope = $scope;

			// make Status available in view
			this.scope.ApplicationState = app.application.ApplicationState;
			this.scope.Status = app.application.Status;

			// initialize scope variables
			this.scope.operationState = app.application.ApplicationState.waiting;
			this.scope.authenticator = authenticationService;
			this.scope.$watch('authenticator', function() {});
			this.scope.registerStatus = null;
			this.scope.hasPPTAccountChanged = false;
			this.scope.projectPlanningTools = [];

			// bind scope functions
			this.scope.changePassword = this.changePassword.bind(this);
			this.scope.register = this.register.bind(this);
			this.scope.logoff = this.logoff.bind(this);
			this.scope.createPPTAccount = this.createPPTAccount.bind(this);
			this.scope.updatePPTAccount = this.updatePPTAccount.bind(this);
			this.scope.pptAccountChanged = this.pptAccountChanged.bind(this);
			this.scope.removePPTAccount = this.removePPTAccount.bind(this);
			this.scope.showSelectedPPTAccount = this.showSelectedPPTAccount.bind(this);
			this.scope.findPPTInList = this.findPPTInList.bind(this);
			this.scope.setOperationFinishState = this.setOperationFinishState.bind(this);
			this.scope.setPPTAccountFinishState = this.setPPTAccountFinishState.bind(this);

			this.loadEntitiesFromRepositories();
		}

		loadEntitiesFromRepositories():void {
			var scope = this.scope;
			var pptAccountRepository = this.pptAccountRepository;
			var settings = this.settings;
			
			this.scope.operationState = app.application.ApplicationState.pending;
			setTimeout(() => { // set operation state to failed if no success after 4 seconds
				if (scope.operationState == app.application.ApplicationState.pending) {
					scope.operationState = app.application.ApplicationState.failed;
					scope.$apply();
				}
			}, 4000);
			this.projectPlanningToolRepository.findAll(function (success, ppts) {
				scope.projectPlanningTools = ppts;

				// prevent request mix of angular -> call sync instead of parallel async
				pptAccountRepository.findAll(function (success, pptAccounts) {
					scope.pptAccounts = pptAccounts;

					setTimeout(() => {
						scope.operationState = app.application.ApplicationState.successful;
						scope.$apply();
					}, settings.messageBoxDelay);
				});
			});
		}
		
		
		changePassword(oldPassword: string, newPassword: string, newPasswordRepeat: string): void {
			var scope = this.scope;
			var settings = this.settings;

			this.scope.changePasswordStatus = app.application.ApplicationState.saving;
			this.authenticationService.changePassword(oldPassword, newPassword, newPasswordRepeat, function(success: boolean) {
				if(success) {
					scope.changePasswordStatus = app.application.ApplicationState.successful;
					setTimeout(() => { scope.changePasswordStatus = null; scope.$apply(); }, settings.successDelay);
				} else {
					scope.changePasswordStatus = app.application.ApplicationState.failed;
				}
			});
		}

        register(username: string, password: string, passwordRepeat: string): void {
			var scope = this.scope;

			this.authenticationService.register(username, password, passwordRepeat, function(success: boolean) {
				if(success) {
					scope.registerStatus = app.application.Status.success;
				} else {
					scope.registerStatus = app.application.Status.error;
				}
			});
		}

		logoff():void {
			this.authenticationService.logout(function(success: boolean) {});
		}

		createPPTAccount(pptUrl:string, userName:string, password:string, ppt:app.domain.model.ppt.ProjectPlanningTool):void {
			var scope = this.scope;

			var pptAccount:app.domain.model.ppt.PPTAccount = new app.domain.model.ppt.PPTAccount(
				this.authenticationService.currentUser, userName, pptUrl, ppt
			);
			pptAccount.pptPassword = password;
			this.scope.pptAccountStatus = app.application.ApplicationState.saving;
			this.pptAccountRepository.add(pptAccount, function (success:boolean, item:app.domain.model.ppt.PPTAccount) {
				scope.setPPTAccountFinishState(success);
			});
		}


		updatePPTAccount(pptAccount:app.domain.model.ppt.PPTAccount):void {
			var scope = this.scope;

			if(this.scope.hasPPTAccountChanged) {
				this.scope.hasPPTAccountChanged = false;
				this.scope.pptAccountStatus = app.application.ApplicationState.saving;
				this.pptAccountRepository.update(pptAccount, function(success, item) {
					scope.setPPTAccountFinishState(success);
				});
			}
		}

		setPPTAccountFinishState(success: boolean):void {
			var scope = this.scope;
			var settings = this.settings;

			if(success) {
				this.scope.pptAccountStatus = app.application.ApplicationState.successful;
				setTimeout(() => { scope.pptAccountStatus = null; scope.$apply(); }, settings.successDelay);
			}else {
				this.scope.pptAccountStatus = app.application.ApplicationState.failed;
			}
		}

		pptAccountChanged():void {
			this.scope.hasPPTAccountChanged = true;
		}

		removePPTAccount(pptAccount:app.domain.model.ppt.PPTAccount):void {
			var scope = this.scope;

			this.scope.pptAccountStatus = app.application.ApplicationState.saving;
			this.pptAccountRepository.remove(pptAccount, function (success) {
				scope.setPPTAccountFinishState(success);
			});
		}

		showSelectedPPTAccount(toUpdatePPTAccount:app.domain.model.ppt.PPTAccount):void {
			toUpdatePPTAccount.ppt = this.scope.findPPTInList(toUpdatePPTAccount.ppt);
		}

		/**
		 * Finds the correct object instance for the given PPT to select it in the list
		 */
		findPPTInList(expectedPPT:app.domain.model.ppt.ProjectPlanningTool):app.domain.model.ppt.ProjectPlanningTool {
			for (var index = 0; index < this.scope.projectPlanningTools.length; ++index) {
				if (this.scope.projectPlanningTools[index].id == expectedPPT.id) {
					return this.scope.projectPlanningTools[index];
				}
			}
			return expectedPPT;
		}

		setOperationFinishState(success:boolean):void {
			var scope = this.scope;
			var settings = this.settings;

			if (success) {
				setTimeout(() => {
					scope.operationState = app.application.ApplicationState.successful;
					scope.$apply();
				}, settings.messageBoxDelay);
			} else {
				setTimeout(() => {
					scope.operationState = app.application.ApplicationState.failed;
					scope.$apply();
				}, settings.messageBoxDelay);
			}
		}
	}
}