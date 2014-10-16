/// <reference path='../../../../public/test/includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/model/User.ts' />
/// <reference path='../../../../app/assets/scripts/classes/service/AuthenticationService.ts' />

module test {
	export module helper {
	}
}

module test {
	export function AuthenticationServiceTest() {
		describe("Authentication service test suite", function() {
			var http, httpBackend, q;

			beforeEach(inject(function ($q, $http, $httpBackend) {
				http = $http;
				httpBackend = $httpBackend;
				q = $q;

			}));

			describe("Status", function() {
				it("Not logged in", function() {
					httpBackend.when("GET", '/user/login-status').respond({});
					var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, q);

					expect(authentivationService.isLoggedIn).toEqual(false);
					expect(authentivationService.currentUser).toEqual(null);

					var returnValue = {};
					authentivationService.loginStatus(function(user) {
						returnValue = user;
					});
					httpBackend.flush();
					expect(returnValue).toEqual(null);
					expect(authentivationService.isLoggedIn).toEqual(false);
					expect(authentivationService.currentUser).toEqual(null);
				});
			});

			describe("Login / Logout", function() {
				it("Successful login & successful logout", function() {
					var testUserData: any = { "id": 5, "name": "peter" };

					httpBackend.when("GET", '/user/login-status').respond({});
					httpBackend.when("POST", '/user/login').respond(testUserData);
					httpBackend.when("POST", '/user/logout').respond(200);

					var returnValue = {};
					var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, q);
					authentivationService.login(testUserData.name, "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: true, user: core.User.createFromJson(testUserData) });
					expect(authentivationService.isLoggedIn).toEqual(true);
					expect(authentivationService.currentUser).toEqual(core.User.createFromJson(testUserData));

					authentivationService.logout(function(status) {
						returnValue = status;
					});
					httpBackend.flush();
					expect(returnValue).toEqual(true);
					expect(authentivationService.isLoggedIn).toEqual(false);
					expect(authentivationService.currentUser).toEqual(null);
				});

				it("Successful login & failed logout", function() {
					var testUserData: any = { "id": 5, "name": "peter" };

					httpBackend.when("GET", '/user/login-status').respond({});
					httpBackend.when("POST", '/user/login').respond(testUserData);
					httpBackend.when("POST", '/user/logout').respond(403);

					var returnValue = {};
					var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, q);
					authentivationService.login(testUserData.name, "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: true, user: core.User.createFromJson(testUserData) });
					expect(authentivationService.isLoggedIn).toEqual(true);
					expect(authentivationService.currentUser).toEqual(core.User.createFromJson(testUserData));

					authentivationService.logout(function(status) {
						returnValue = status;
					});
					httpBackend.flush();
					expect(returnValue).toEqual(false);
					expect(authentivationService.isLoggedIn).toEqual(true);
					expect(authentivationService.currentUser).toEqual(core.User.createFromJson(testUserData));
				});

				it("Failed login", function() {
					var testUserData: any = { "id": 5, "name": "peter" };

					httpBackend.when("GET", '/user/login-status').respond({});
					httpBackend.when("POST", '/user/login').respond(403);

					var returnValue = {};
					var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, q);
					authentivationService.login(testUserData.name, "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: false, user: null });
					expect(authentivationService.isLoggedIn).toEqual(false);
					expect(authentivationService.currentUser).toEqual(null);
				});


			});

			describe("Registration", function() {
				it("Successful registration", function() {
					var testUser: any = { "id": 5, "name": "peter" };

					httpBackend.when("GET", '/user/login-status').respond({});
					httpBackend.when("POST", '/user/register').respond(testUser);

					var returnValue = {};
					var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, q);
					authentivationService.register(testUser.name, "pwd", "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: true, user: core.User.createFromJson(testUser) });
				});

				it("Malformed data returned", function() {
					httpBackend.when("GET", '/user/login-status').respond({});
					httpBackend.when("POST", '/user/register').respond({});

					var returnValue = {};
					var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, q);
					authentivationService.register("peter", "pwd", "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: true, user: core.User.createFromJson({}) });
				});

				it("Failed registration", function() {
					httpBackend.when("GET", '/user/login-status').respond({});
					httpBackend.when("POST", '/user/register').respond(403);

					var returnValue = {};
					var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, q);
					authentivationService.register("peter", "pwd", "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: false, user: null });
				});
			});
		});
	}
}