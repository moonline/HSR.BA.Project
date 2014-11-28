package logics;

import controllers.AuthenticationChecker;
import daos.user.UserDAO;
import logics.user.UserLogic;
import models.user.User;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import play.db.jpa.JPA;
import play.mvc.Http;

public class Logger {

	@NotNull
	private final play.Logger.ALogger logger;
	@NotNull
	private final AuthenticationChecker authenticationChecker;

	public Logger(String name) {
		logger = play.Logger.of(name);
		//The logger is used in so many places that it's infeasible to inject all required objects everywhere.
		//And there is no need for injecting it, as it's generally not part of the tests.
		//So it's created here directly.
		UserDAO userDAO = new UserDAO();
		authenticationChecker = new AuthenticationChecker(userDAO, new UserLogic(userDAO, null));
	}

	public void debug(@NotNull String action, @NotNull Object... params) {
		if (!action.equals("looked for select u from User u where u.name = ?") && !action.startsWith("looked for User with id ")) { //prevent Stack Overflow Exception on logging (Logger calls this method itself)
			Http.Context context = getContextIfPossible();
			if (context != null) {
				User loggedInUser = getLoggedInUserWithOrWithoutTransaction(context);
				logger.debug((loggedInUser == null ? "A not logged in user" : loggedInUser) + " from " + context.request().remoteAddress() + " " + action, params);
			} else {
				logger.debug(action, params);
			}
		}
	}

	@Nullable
	private Http.Context getContextIfPossible() {
		try {
			return Http.Context.current();
		} catch (RuntimeException noContext) {
			return null;
		}
	}

	private User getLoggedInUserWithOrWithoutTransaction(Http.Context ctx) {
		if (isThereATransaction()) {
			return authenticationChecker.getLoggedInUser(ctx);
		}
		try {
			return JPA.withTransaction(() -> authenticationChecker.getLoggedInUser(ctx));
		} catch (Throwable t) {
			throw new RuntimeException(t);
		}
	}

	private boolean isThereATransaction() {
		try {
			JPA.em();
			return true; //em bound
		} catch (RuntimeException noEmBound) {
			return false; //no em bound
		}
	}

}
