package controllers.user;

import controllers.GuaranteeAuthenticatedUser;
import docs.QueryDescription;
import docs.QueryParameters;
import docs.QueryResponses;
import logics.user.UserLogic;
import models.user.User;
import play.data.DynamicForm;
import play.data.Form;
import play.db.jpa.Transactional;
import play.mvc.Controller;
import play.mvc.Result;

import static docs.QueryResponses.Response;

public class UserController extends Controller {

	public static final UserLogic USER_LOGIC = new UserLogic();

	@Transactional(readOnly = true)
	public static Result login() {
		DynamicForm requestData = Form.form().bindFromRequest();
		String name = requestData.get("name");
		String password = requestData.get("password");
		if (name == null || password == null) {
			return badRequest("Missing login data");
		}
		final User user = USER_LOGIC.loginUser(name, password, session());
		if (user == null) {
			return badRequest("Username or Password wrong");
		}
		return ok(USER_LOGIC.getAsJson(user));
	}

	public static Result logout() {
		USER_LOGIC.logoutUser(session());
		return ok();
	}

	@Transactional(readOnly = true)
	public static Result login_status() {
		final User user = USER_LOGIC.getLoggedInUser(session());
		return ok(USER_LOGIC.getAsJson(user));
	}

	@Transactional()
	@QueryParameters({
			@QueryParameters.Parameter(name = "name", description = "username"),
			@QueryParameters.Parameter(name = "password", description = "the new password for the user"),
			@QueryParameters.Parameter(name = "password_repeat", description = "the new password for the user (repetition, to guarantee the user didn't make a typo)")})
	@QueryDescription("This creates a new EEPPI-user.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the user could not be created."),
			@Response(status = OK, description = "If the user could be created, it is returned.")
	})
	public static Result register() {
		DynamicForm requestData = Form.form().bindFromRequest();
		String name = requestData.get("name");
		String password = requestData.get("password");
		String password_repeat = requestData.get("password_repeat");
		if (name == null || password == null) {
			return badRequest("Missing registration data");
		} else if (!password.equals(password_repeat)) {
			return badRequest("The two passwords do not match");
		}
		final User user = USER_LOGIC.createUser(name, password);
		return ok(USER_LOGIC.getAsJson(user));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	public static Result changePassword() {
		User user = USER_LOGIC.getLoggedInUser(session());
		DynamicForm requestData = Form.form().bindFromRequest();
		String old_password = requestData.get("old_password");
		String new_password = requestData.get("new_password");
		String new_password_repeat = requestData.get("new_password_repeat");
		if (new_password == null || new_password_repeat == null) {
			return badRequest("Missing new password");
		} else if (!new_password.equals(new_password_repeat)) {
			return badRequest("The two passwords do not match");
		}
		if (USER_LOGIC.changePassword(user, old_password, new_password)) {
			return ok();
		} else {
			return badRequest("Could not change password");
		}
	}

}
