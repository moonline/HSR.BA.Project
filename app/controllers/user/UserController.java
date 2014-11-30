package controllers.user;

import com.fasterxml.jackson.databind.node.ObjectNode;
import controllers.AbstractController;
import controllers.AuthenticationChecker;
import controllers.GuaranteeAuthenticatedUser;
import logics.docs.*;
import logics.user.UserLogic;
import models.user.User;
import play.data.Form;
import controllers.Transactional;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;
import static logics.docs.QueryResponses.Response;

public class UserController extends AbstractController {

	private final UserLogic USER_LOGIC;
	private final AuthenticationChecker AUTHENTICATION_CHECKER;

	public UserController(UserLogic userLogic, AuthenticationChecker authenticationChecker, DocumentationLogic documentationLogic) {
		super(documentationLogic);
		USER_LOGIC = userLogic;
		AUTHENTICATION_CHECKER = authenticationChecker;
	}

	@Transactional(readOnly = true)
	@QueryParameters({
			@Parameter(name = "name", description = "username"),
			@Parameter(name = "password", description = "the password for the user")
	})
	@QueryDescription("Checks the login information for the user and if the login is successful a cookie is set.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the user could not be logged in."),
			@Response(status = OK, description = "If the user could be logged in, and a cookie is set.")
	})
	@QueryExamples({
			@Example(parameters = {"demo", "demo"}, response = @Example.Response(status = OK, content = "{\"id\":1,\"name\":\"demo\"}")),
			@Example(parameters = {"demo", "invalid password"}),
			@Example(parameters = {"demo", ""})
	})
	public Result login() {
		Form<UserLogic.LoginForm> form = Form.form(UserLogic.LoginForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		final User user = AUTHENTICATION_CHECKER.loginUser(form.get(), session());
		if (user == null) {
			return badRequest("Username or Password wrong");
		}
		return ok(jsonify(user));
	}

	@QueryDescription("Does log out the currently logged in user by removing the cookie.")
	@QueryResponses(@Response(status = NO_CONTENT, description = "Is always returned, and the login cookie is being removed."))
	@QueryExamples(@Example(parameters = {}))
	public Result logout() {
		session().remove(AuthenticationChecker.SESSION_USER_IDENTIFIER);
		return noContent();
	}

	@QueryDescription("Returns the login status for the currently logged in user and a Json representation of it.")
	@QueryResponses(@Response(status = OK, description = "Is always returned, and a Json containing either nothing (if no user is logged in) or the user."))
	@QueryExamples({
			@Example(parameters = {}),
			@Example(parameters = {}, response = @Example.Response(status = OK, content = "{\n" +
					"\n" +
					"    \"id\": 1,\n" +
					"    \"name\": \"demo\"\n" +
					"\n" +
					"}"))
	})
	@Transactional(readOnly = true)
	public Result loginStatus() {
		final User user = AUTHENTICATION_CHECKER.getLoggedInUser(ctx());
		if (user == null) {
			return ok(new ObjectNode(null));
		} else {
			return ok(jsonify(user));
		}
	}

	@Transactional()
	@QueryParameters({
			@Parameter(name = "name", description = "username"),
			@Parameter(name = "password", description = "the new password for the user"),
			@Parameter(name = "passwordRepeat", description = "the new password for the user (repetition, to guarantee the user didn't make a typo)")})
	@QueryDescription("This creates a new EEPPI-user.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the user could not be created."),
			@Response(status = OK, description = "If the user could be created, it is returned.")
	})
	@QueryExamples({
			@Example(parameters = {"New Username 1", "1234", "1234"}),
			@Example(parameters = {"New Username 2", "1234", "another password"})
	})
	public Result register() {
		Form<UserLogic.RegisterForm> form = Form.form(UserLogic.RegisterForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(USER_LOGIC.createUser(form.get())));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@Parameter(name = "oldPassword", description = "the current password for the user"),
			@Parameter(name = "newPassword", description = "the new password for the user"),
			@Parameter(name = "newPasswordRepeat", description = "the new password for the user (repetition, to guarantee the user didn't make a typo)")})
	@QueryDescription("This changes the password of an EEPPI-user.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the password could not be changed."),
			@Response(status = OK, description = "If the password was changed.")
	})
	@QueryExamples({
			@Example(parameters = {"demo", "1234", "1234"}, response = @Example.Response(status = OK, content = "")),
			@Example(parameters = {"demo", "1234", "another password"})
	})
	public Result changePassword() {
		Form<UserLogic.ChangePasswordForm> form = Form.form(UserLogic.ChangePasswordForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		User user = AUTHENTICATION_CHECKER.getLoggedInUser(ctx());
		if (USER_LOGIC.changePassword(user, form.get())) {
			return ok();
		} else {
			return badRequest("Could not change password");
		}
	}

}
