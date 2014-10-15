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
			var http, httpBackend, rootScope, q;

			beforeEach(inject(function ($q, $rootScope, $http, $httpBackend) {
				rootScope = $rootScope;
				http = $http;
				httpBackend = $httpBackend;
				q = $q;

			}));

			it("No user logged in", function() {
				httpBackend.when("GET", '/user/login-status').respond({});
				var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, rootScope, q);

				expect(authentivationService.isLoggedIn).toEqual(false);
				expect(authentivationService.currentUser).toEqual(null);

				var returnValue;
				authentivationService.loginStatus(function(user) {
					returnValue = user;
				});
				httpBackend.flush();
				expect(returnValue).toEqual(null);
				expect(authentivationService.isLoggedIn).toEqual(false);
				expect(authentivationService.currentUser).toEqual(null);
			});

			it("User register successfull", function() {
				var testUser: any = { "id": 5, "name": "peter" };

				httpBackend.when("GET", '/user/login-status').respond({});
				httpBackend.when("POST", '/user/register').respond(testUser);

				var returnValue;
				var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, rootScope, q);
				authentivationService.register(testUser.name, "pwd", "pwd", function(status, user) {
					returnValue = { "status": status, "user": user };
				});
				httpBackend.flush();
				expect(returnValue).toEqual({ status: true, user: core.User.createFromJson(testUser) });
			});

			it("User register empty user returned", function() {
				httpBackend.when("GET", '/user/login-status').respond({});
				httpBackend.when("POST", '/user/register').respond({});

				var returnValue;
				var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, rootScope, q);
				authentivationService.register("peter", "pwd", "pwd", function(status, user) {
					returnValue = { "status": status, "user": user };
				});
				httpBackend.flush();
				expect(returnValue).toEqual({ status: true, user: core.User.createFromJson({}) });
			});

			it("User register fail", function() {
				httpBackend.when("GET", '/user/login-status').respond({});
				httpBackend.when("POST", '/user/register').respond(403);

				var returnValue;
				var authentivationService: core.AuthenticationService = new core.AuthenticationService(http, rootScope, q);
				authentivationService.register("peter", "pwd", "pwd", function(status, user) {
					returnValue = { "status": status, "user": user };
				});
				httpBackend.flush();
				expect(returnValue).toEqual({ status: false, user: null });
			});
		});
	}
}