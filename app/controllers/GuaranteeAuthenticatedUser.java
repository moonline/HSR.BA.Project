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

		private static final UserLogic USER_LOGIC = new UserLogic();

		@Override
		public F.Promise<Result> call(final Http.Context ctx) throws Throwable {
			if (USER_LOGIC.isUserLoggedIn(ctx.session())) {
				return delegate.call(ctx);
			} else {
				return denyAccess();
			}
		}

		private static F.Promise<Result> denyAccess() {
			return F.Promise.promise(new F.Function0<Result>() {
				@Override
				public Result apply() throws Throwable {
					return forbidden("You need to authenticate to use this resource.");
				}
			});
		}
	}

}

