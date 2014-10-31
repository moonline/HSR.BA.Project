/// <reference path='../../configuration/paths.ts' />

/// <reference path='../domain/model/User.ts' />

/// <reference path='../../classes/domain/factory/ObjectFactory.ts' />

module app.service {
	export class AuthenticationService {
		private resources: { [index: string]: string } = {};
		private httpService;
		private isUserLoggedIn: boolean = false;
		private loggedInUser: app.domain.model.core.User = null;
		private ready: { resolve: (user: app.domain.model.core.User) => any; reject: () => any; promise: any; };

		constructor(httpService, $q) {
			this.ready = $q.defer();
			this.httpService = httpService;
			this.resources = {
				'login': configuration.paths.user.login,
				'logout': configuration.paths.user.logout,
				'status': configuration.paths.user.status,
				'register': configuration.paths.user.register,
				'changePassword': configuration.paths.user.changePassword
			};
			this.loginStatus(function(user:app.domain.model.core.User) {
				if(user != null) {
					this.ready.resolve(this.loggedInUser);
				} else {
					this.ready.reject();
				}
			}.bind(this));
		}

		public login(username: string, password: string, callback: (success: boolean, item: app.domain.model.core.User) => void = (s,i) => {}): void {
			this.httpService.post(
				this.resources['login'],
				{ "name": username, "password": password }
			).success(function(data, status, headers, config) {
				var user: app.domain.model.core.User = app.domain.factory.ObjectFactory.createFromJson(app.domain.model.core.User,data);
				this.loggedInUser = user;
				this.isUserLoggedIn = true;
				callback(true, user);
			}.bind(this)).error(function(data, status, headers, config) {
				callback(false, null);
			}.bind(this));
		}

		public logout(callback: (success: boolean) => void = (s) => {}) {
			this.httpService.post(
				this.resources['logout'], {}
			).success(function(data, status, headers, config){
				this.loggedInUser = null;
				this.isUserLoggedIn = false;
				callback(true);
			}.bind(this)).error(function(data, status, headers, config) {
				callback(false);
			}.bind(this));
		}

		public register(username: string, password: string, passwordRepeat: string, callback: (success: boolean, item: app.domain.model.core.User) => void = (s,i) => {}): void {
			this.httpService.post(
				this.resources['register'],
				{ "name": username, "password": password, "password_repeat": passwordRepeat }
			).success(function(data, status, headers, config) {
					callback(true, app.domain.factory.ObjectFactory.createFromJson(app.domain.model.core.User,data));
			}.bind(this)).error(function(data, status, headers, config) {
					callback(false, null);
			}.bind(this));
		}

		public loginStatus(callback: (item: app.domain.model.core.User) => void = (i) => {}): void {
			this.httpService.get(this.resources['status']).success(function(data) {
				if(data != null && data != {} && app.domain.model.core.User.isCompatibleObject(data)) {
					var user: app.domain.model.core.User = app.domain.factory.ObjectFactory.createFromJson(app.domain.model.core.User,data);
					this.loggedInUser = user;
					this.isUserLoggedIn = true;
					callback(user);
				} else {
					callback(null);
				}
			}.bind(this));
		}

		public changePassword(oldPassword: string, newPassword: string, newPasswordRepeat: string, callback: (success: boolean) => void = (s) => {}) {
			this.httpService.post(
				this.resources['changePassword'],
				{ "old_password": oldPassword, "new_password": newPassword, "new_password_repeat": newPasswordRepeat }
			).success(function(data, status, headers, config){
					callback(true);
				}.bind(this)).error(function(data, status, headers, config) {
					callback(false);
				}.bind(this));
		}

		get isLoggedIn(): boolean {
			return this.isUserLoggedIn;
		}

		get currentUser(): app.domain.model.core.User {
			return this.loggedInUser;
		}

		get readyPromise() {
			return this.ready.promise;
		}
	}
}