/// <reference path='../../configuration/paths.ts' />

/// <reference path='../domain/model/User.ts' />

/// <reference path='../../classes/domain/factory/ObjectFactory.ts' />

module app.service {
	export class AuthenticationService {
		private resources: any; //TODO { [index: string]: any } = {};
		private httpService;
		private isUserLoggedIn: boolean = false;
		private loggedInUser: app.domain.model.core.User = null;
		private ready: { resolve: (user: app.domain.model.core.User) => any; reject: () => any; promise: any; };

		constructor(httpService, $q) {
			this.ready = $q.defer();
			this.httpService = httpService;
			this.resources = configuration.paths.user;

			this.loginStatus(function(user:app.domain.model.core.User) {
				if(user != null) {
					this.ready.resolve(this.loggedInUser);
				} else {
					this.ready.reject();
				}
			}.bind(this));
		}

		public login(username: string, password: string, callback: (success: boolean, item: app.domain.model.core.User) => void = (s,i) => {}): void {
			var method: string = this.resources['login']['method'].toLowerCase();
			var url: string = this.resources['login']['url'];

			this.httpService[method](
				url,
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
			var method: string = this.resources['logout']['method'].toLowerCase();
			var url: string = this.resources['logout']['url'];

			this.httpService[method](url, {})
				.success(function(data, status, headers, config){
					this.loggedInUser = null;
					this.isUserLoggedIn = false;
					callback(true);
				}.bind(this)).error(function(data, status, headers, config) {
					callback(false);
				}.bind(this));
		}

		public register(username: string, password: string, passwordRepeat: string, callback: (success: boolean, item: app.domain.model.core.User) => void = (s,i) => {}): void {
			var method: string = this.resources['register']['method'].toLowerCase();
			var url: string = this.resources['register']['url'];

			this.httpService[method](
				url,
				{ "name": username, "password": password, "passwordRepeat": passwordRepeat }
			).success(function(data, status, headers, config) {
					callback(true, app.domain.factory.ObjectFactory.createFromJson(app.domain.model.core.User,data));
			}.bind(this)).error(function(data, status, headers, config) {
					callback(false, null);
			}.bind(this));
		}

		public loginStatus(callback: (item: app.domain.model.core.User) => void = (i) => {}): void {
			var method: string = this.resources['status']['method'].toLowerCase();
			var url: string = this.resources['status']['url'];

			this.httpService[method](url).success(function(data) {
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
			var method: string = this.resources['changePassword']['method'].toLowerCase();
			var url: string = this.resources['changePassword']['url'];

			this.httpService[method](
				url,
				{ "oldPassword": oldPassword, "newPassword": newPassword, "newPasswordRepeat": newPasswordRepeat }
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