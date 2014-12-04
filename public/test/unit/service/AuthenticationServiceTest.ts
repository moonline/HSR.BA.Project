/// <reference path='../../../../public/test/includes.ts' />

/// <reference path='../../../../app/assets/scripts/classes/domain/model/User.ts' />
/// <reference path='../../../../app/assets/scripts/classes/service/AuthenticationService.ts' />

module test {
	export module helper {
	}
}

module test.logic.service {
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
					httpBackend.when("GET",'/rest/api/1/user/loginStatus').respond({});
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);

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
					var testUser = (function(){
						var user: app.domain.model.core.User = new app.domain.model.core.User(testUserData.name);
						user.id = testUserData.id;
						return user;
					})();

					httpBackend.expectGET('/rest/api/1/user/loginStatus').respond({});
					httpBackend.when('POST','/rest/api/1/user/login').respond(testUserData);
					httpBackend.when('POST','/rest/api/1/user/logout').respond(200);

					var returnValue = {};
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);
					authentivationService.login(testUserData.name, "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: true, user: testUser });
					expect(authentivationService.isLoggedIn).toEqual(true);
					expect(authentivationService.currentUser).toEqual(testUser);

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
					var testUser = (function(){
						var user: app.domain.model.core.User = new app.domain.model.core.User(testUserData.name);
						user.id = testUserData.id;
						return user;
					})();

					httpBackend.expectGET('/rest/api/1/user/loginStatus').respond({});
					httpBackend.when('POST','/rest/api/1/user/login').respond(testUserData);
					httpBackend.when('POST','/rest/api/1/user/logout').respond(403);

					var returnValue = {};
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);
					authentivationService.login(testUserData.name, "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: true, user: testUser });
					expect(authentivationService.isLoggedIn).toEqual(true);
					expect(authentivationService.currentUser).toEqual(testUser);

					authentivationService.logout(function(status) {
						returnValue = status;
					});
					httpBackend.flush();
					expect(returnValue).toEqual(false);
					expect(authentivationService.isLoggedIn).toEqual(true);
					expect(authentivationService.currentUser).toEqual(testUser);
				});

				it("Failed login", function() {
					var testUserData: any = { "id": 5, "name": "peter" };

					httpBackend.expectGET('/rest/api/1/user/loginStatus').respond({});
					httpBackend.expectPOST('/rest/api/1/user/login').respond(403);

					var returnValue = {};
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);
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
					var testUserData: any = { "id": 5, "name": "peter" };
					var testUser = (function(){
						var user: app.domain.model.core.User = new app.domain.model.core.User(testUserData.name);
						user.id = testUserData.id;
						return user;
					})();

					httpBackend.expectGET('/rest/api/1/user/loginStatus').respond({});
					httpBackend.expectPOST('/rest/api/1/user/register').respond(testUserData);

					var returnValue = {};
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);
					authentivationService.register(testUserData.name, "pwd", "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: true, user: testUser });
				});

				it("Malformed data returned", function() {
					httpBackend.expectGET('/rest/api/1/user/loginStatus').respond({});
					httpBackend.expectPOST('/rest/api/1/user/register').respond({});

					var returnValue = {};
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);
					authentivationService.register("peter", "pwd", "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});

					var nullUser: app.domain.model.core.User = new app.domain.model.core.User(null);
					httpBackend.flush();
					expect(returnValue).toEqual({ status: true, user: nullUser });
				});

				it("Failed registration", function() {
					httpBackend.expectGET('/rest/api/1/user/loginStatus').respond({});
					httpBackend.expectPOST('/rest/api/1/user/register').respond(403);

					var returnValue = {};
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);
					authentivationService.register("peter", "pwd", "pwd", function(status, user) {
						returnValue = { "status": status, "user": user };
					});
					httpBackend.flush();
					expect(returnValue).toEqual({ status: false, user: null });
				});
			});

			describe("Password change", function() {
				it("Successful password change", function() {
					httpBackend.expectGET('/rest/api/1/user/loginStatus').respond({});
					httpBackend.expectPOST('/rest/api/1/user/changePassword').respond({});

					var returnValue = {};
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);
					authentivationService.changePassword("oldPwd", "pwd", "pwd", function(status) {
						returnValue = status;
					});
					httpBackend.flush();
					expect(returnValue).toEqual(true);
				});

				it("Failed password change", function() {
					httpBackend.expectGET('/rest/api/1/user/loginStatus').respond({});
					httpBackend.expectPOST('/rest/api/1/user/changePassword').respond(403);

					var returnValue = {};
					var authentivationService: app.service.AuthenticationService = new app.service.AuthenticationService(http, q);
					authentivationService.changePassword("dontKnowOldOwd", "pwd", "pwd", function(status) {
						returnValue = status;
					});
					httpBackend.flush();
					expect(returnValue).toEqual(false);
				});
			});
		});
	}
}