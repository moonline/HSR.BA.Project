/// <reference path='../../../classes/domain/repository/Repository.ts' />
/// <reference path='../../../classes/domain/model/User.ts' />

module core {
	export class UserRepository extends core.Repository<User> {
		constructor(httpService) {
			super(httpService);
			this.type = User;
			this.resources = {
				'all': 'data/eeppi/tasktemplate/list.json',
				'login':'/user/login',
				'logout':'/user/logout',
				'status': '/user/login-status',
				'register': '/user/register'
			};
		}

		// TODO: Is a logged in user allowed to list all users?
		public findAll(callback: (items: User[]) => void): void {
			this.loginStatus(function(user: User) {
				if(user) {
					callback([user]);
				} else {
					callback([]);
				}
			});
		}

		// TODO: Is a logged in user allowed to list all users?
		public findOneById(id: number, callback: (item: User) => void): void {

		}

		public login(username: string, password: string, callback: (success: boolean, item: User) => void): void {
			this.httpService.post(
				this.resources['login'],
				{ "name": username, "password": password }
			).success(function(data, status, headers, config) {
				callback(true, new User(username));
			}).error(function(data, status, headers, config) {
				callback(false, null);
			});
		}

		public logout(callback: (success: boolean) => void) {
			this.httpService.post(
				this.resources['logout'], {}
			).success(function(data, status, headers, config){
				callback(true);
			}).error(function(data, status, headers, config) {
				callback(false);
			});
		}

		public add(item: User, callback: (item: User) => void): void {
		}

		public register(username: string, password: string, passwordRepeat: string, callback: (success: boolean) => void): void {
			this.httpService.post(
				this.resources['register'],
				{ "name": username, "password": password, "password_repeat": passwordRepeat }
			).success(function(data, status, headers, config) {
					callback(true);
			}).error(function(data, status, headers, config) {
					callback(false);
			});
		}

		public loginStatus(callback: (item: User) => void): void {
			this.httpService.get(this.resources['status']).success(function(data) {
				if(data.is_logged_in === true) {
					callback(new User(data.name));
				} else {
					callback(null);
				}
			});
		}
	}
}