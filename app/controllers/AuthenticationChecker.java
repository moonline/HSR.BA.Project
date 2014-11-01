package controllers;

import daos.user.UserDAO;
import logics.user.UserLogic;
import models.user.User;
import play.libs.F;
import play.mvc.Action;
import play.mvc.Http;
import play.mvc.Result;

import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.util.logging.Logger;

public class AuthenticationChecker {

	public static final String SESSION_USER_IDENTIFIER = "user";
	private final UserDAO USER_DAO;
	private final UserLogic USER_LOGIC;

	public AuthenticationChecker(UserDAO userDao, UserLogic userLogic) {
		USER_DAO = userDao;
		USER_LOGIC = userLogic;
	}

	public User loginUser(UserLogic.LoginForm loginForm, Http.Session session) {
		User user = USER_LOGIC.readUser(loginForm.name, loginForm.password);
		if (user != null) {
			session.put(SESSION_USER_IDENTIFIER, user.getId() + "");
		}
		return user;
	}

	public User getLoggedInUser(Http.Context context) {
		if (isBasicAuthenticationEnabled(context)) {
			return getLoggedInUserByHttpBasicAuth(context);
		} else {
			return getLoggedInUserByCookie(context);
		}
	}

	private boolean isBasicAuthenticationEnabled(Http.Context ctx) {
		return "true".equals(ctx.request().getQueryString("basicAuth"));
	}

	private User getLoggedInUserByHttpBasicAuth(Http.Context context) {
		String authHeader = context.request().getHeader("authorization");
		if (authHeader == null) {
			return null;
		}
		authHeader = authHeader.substring(6);
		String[] credentials;
		try {
			credentials = new String(DatatypeConverter.parseBase64Binary(authHeader), "UTF-8").split(":");
		} catch (IOException e) {
			Logger.getAnonymousLogger().fine("Could not decode authentication header " + authHeader);
			return null;
		}
		if (credentials.length != 2) {
			return null;
		}
		User user = USER_DAO.readByName(credentials[0]);
		if (user == null || !USER_LOGIC.passwordCorrect(user, credentials[1])) {
			return null;
		}
		return user;
	}

	private User getLoggedInUserByCookie(Http.Context context) {
		String userIdString = context.session().get(SESSION_USER_IDENTIFIER);
		if (userIdString == null || !userIdString.matches("\\d+")) {
			return null;
		}
		Long userId = Long.valueOf(userIdString);
		return USER_DAO.readById(userId);
	}


	/**
	 * Checks for a logged in user and returns a 403-response if there is none.
	 */
	public class Authenticator extends Action.Simple {

		@Override
		public F.Promise<Result> call(final Http.Context ctx) throws Throwable {
			boolean isUserLoggedIn = getLoggedInUser(ctx) != null;
			if (isUserLoggedIn) {
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

	}
}
