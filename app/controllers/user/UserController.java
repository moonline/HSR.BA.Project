package controllers.user;

import logics.user.UserLogic;
import play.data.DynamicForm;
import play.data.Form;
import play.db.jpa.Transactional;
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
		} else if (USER_LOGIC.loginUser(name, password, session()) == null) {
			return badRequest("Username or Password wrong");
		}
		return ok();
	}

	public static Result logout() {
		USER_LOGIC.logoutUser(session());
		return ok();
	}

	public static Result login_status() {
		return TODO;
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

}
