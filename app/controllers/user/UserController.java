package controllers.user;

import com.fasterxml.jackson.databind.node.ObjectNode;
import logics.user.UserLogic;
import models.user.User;
import play.data.DynamicForm;
import play.data.Form;
import play.db.jpa.Transactional;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

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
		ObjectNode result = Json.newObject();
		User user = USER_LOGIC.getLoggedInUser(session());
		result.put("is_logged_in", user != null);
		if (user != null) {
			result.put("name", user.getName());
		}
		return ok(result);
	}

	@Transactional()
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
		USER_LOGIC.createUser(name, password);
		return ok();
	}

	@Transactional()
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
