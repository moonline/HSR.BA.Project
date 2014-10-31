package controllers;

import logics.user.UserLogic;
import play.libs.F;
import play.mvc.Action;
import play.mvc.Http;
import play.mvc.Result;
import play.mvc.With;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@With(GuaranteeAuthenticatedUser.Authenticator.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface GuaranteeAuthenticatedUser {

	/**
	 * Checks for a logged in user and returns a 403-response if there is none.
	 */
	public class Authenticator extends Action.Simple {

		private final UserLogic USER_LOGIC;

		public Authenticator(UserLogic userLogic) {
			USER_LOGIC = userLogic;
		}

		@Override
		public F.Promise<Result> call(final Http.Context ctx) throws Throwable {
			if (USER_LOGIC.isUserLoggedIn(ctx)) {
				return delegate.call(ctx);
			} else {
				return denyAccess(ctx);
			}
		}

		private F.Promise<Result> denyAccess(Http.Context ctx) {
			return F.Promise.promise(() -> {
				if (isBasicAuthenticationEnabled(ctx)) {
					ctx.response().setHeader("WWW-Authenticate", "Basic realm=\"" + "" /*  <-- you could provide a description for this site here */ + "\"");
				}
				return unauthorized("You need to authenticate to use this resource. You can either login or use the HTTP Basic Authentication.");
			});
		}

		public static boolean isBasicAuthenticationEnabled(Http.Context ctx) {
			return "true".equals(ctx.request().getQueryString("basicAuth"));
		}
	}

}

