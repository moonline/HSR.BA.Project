/// <reference path='../../configuration/paths.ts' />

/// <reference path='../../classes/domain/model/User.ts' />

/// <reference path='../../classes/domain/factory/ObjectFactory.ts' />

module app.service {
	export class AuthenticationService {
		private resources: { [index: string]: { method: string; url: string; } };
		private httpService;
		private isUserLoggedIn: boolean = false;
		private loggedInUser: app.domain.model.core.User = null;
		private ready: { resolve: (user: app.domain.model.core.User) => any; reject: () => any; promise: any; };

		/**
		 * @param httpService - Angular $http ajax service
		 * @param $q - Angular $q async service (promises/deferred)
		 */
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

		/**
		 * log a user in
		 *
		 * @param username - Unique identifier (username) of the user
		 * @param password
		 * @param callback - Will be called with (true, user) on success successful login and with (false, null) on error
		 */
		public login(username: string, password: string, callback: (success: boolean, user: app.domain.model.core.User) => void = (s,i) => {}): void {
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

		/**
		 * log the current user out
		 *
		 * @param callback - Will be called with (true) on success successful logout and with (false) on error
		 */
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

		/**
		 * register a new user
		 *
		 * @param username - Unique identifier for the new user
		 * @param password
		 * @param passwordRepeat - Must be same as password. otherwise server will reject request
		 * @param callback - Will be called with (true) on success successful register and with (false) on error
		 */
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

		/**
		 * Finds if a user is logged in and updates the current status
		 *
		 * @param callback - Will be called with (user) if a user is logged in and (null) if not.
		 */
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

		/**
		 * Change the password of the current user
		 *
		 * @param oldPassword
		 * @param newPassword
		 * @param newPasswordRepeat
		 * @param callback - Will be called with (true) on success successful password change and with (false) on error
		 */
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

		/**
		 * Angular promise, used to be notified on promise completed
		 *
		 * @example:
		 * 		authenticationService.readyPromise.then(function(user) { $scope.displayUser = user; })
		 * @returns Angular promise
		 */
		get readyPromise() {
			return this.ready.promise;
		}
	}
}