/// <reference path='../../configuration/paths.ts' />

/// <reference path='../domain/model/User.ts' />

/// <reference path='../../classes/domain/factory/ObjectFactory.ts' />

module core {
	export class AuthenticationService {
		private resources: { [index: string]: string } = {};
		private httpService;
		private isUserLoggedIn: boolean = false;
		private loggedInUser: User = null;
		private ready;

		constructor(httpService, $q) {
			this.ready = $q.defer();
			this.httpService = httpService;
			this.resources = {
				'login': configuration.paths.user.login,
				'logout': configuration.paths.user.logout,
				'status': configuration.paths.user.status,
				'register': configuration.paths.user.register
			};
			this.loginStatus(function(user:User) {
				if(user != null) {
					console.log(user);
					this.ready.resolve(this.loggedInUser);
				} else {
					this.ready.reject();
				}
			}.bind(this));
		}

		public login(username: string, password: string, callback: (success: boolean, item: User) => void = (s,i) => {}): void {
			this.httpService.post(
				this.resources['login'],
				{ "name": username, "password": password }
			).success(function(data, status, headers, config) {
				var user: User = ObjectFactory.createFromJson(User,data);
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

		public register(username: string, password: string, passwordRepeat: string, callback: (success: boolean, item: User) => void = (s,i) => {}): void {
			this.httpService.post(
				this.resources['register'],
				{ "name": username, "password": password, "password_repeat": passwordRepeat }
			).success(function(data, status, headers, config) {
					callback(true, ObjectFactory.createFromJson(User,data));
			}.bind(this)).error(function(data, status, headers, config) {
					callback(false, null);
			}.bind(this));
		}

		public loginStatus(callback: (item: User) => void = (i) => {}): void {
			this.httpService.get(this.resources['status']).success(function(data) {
				if(data != null && data != {} && User.isCompatibleObject(data)) {
					var user: User = ObjectFactory.createFromJson(User,data);
					this.loggedInUser = user;
					this.isUserLoggedIn = true;
					callback(user);
				} else {
					callback(null);
				}
			}.bind(this));
		}

		get isLoggedIn(): boolean {
			return this.isUserLoggedIn;
		}

		get currentUser(): User {
			return this.loggedInUser;
		}

		get readyPromise() {
			return this.ready.promise;
		}
	}
}