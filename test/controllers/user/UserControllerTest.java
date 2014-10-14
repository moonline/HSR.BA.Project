package controllers.user;

import controllers.AbstractControllerTest;
import daos.user.UserDAO;
import logics.user.UserLogic;
import models.user.User;
import org.fest.assertions.MapAssert;
import org.junit.Test;
import play.mvc.Result;
import test.AbstractTestDataCreator;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.BAD_REQUEST;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.*;

public class UserControllerTest extends AbstractControllerTest {

	public static final UserDAO USER_DAO = new UserDAO();
	public static final UserLogic USER_LOGIC = new UserLogic();

	@Test
	public void testLoginWithoutParams() {
		Result result = callAction(controllers.user.routes.ref.UserController.login());
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
	}

	@Test
	public void testLoginSuccessful() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("Hansli", "1234");
		//Test
		Result result = callPostAction(controllers.user.routes.ref.UserController.login(), postData("name", "Hansli", "password", "1234"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, USER_LOGIC.getAsJson(user));
		verifyLoggedIn(user, result, true);
	}

	private void verifyLoggedIn(User user, Result result, boolean expectedLogedIn) {
		MapAssert session = assertThat(session(result));
		MapAssert.Entry userToken = MapAssert.entry(UserLogic.SESSION_USER_IDENTIFIER, user.getId() + "");
		if (!expectedLogedIn) {
			session.excludes(userToken);
		} else {
			session.includes(userToken);
		}
	}

	@Test
	public void testLoginWithBadPassword() throws Throwable {
		AbstractTestDataCreator.createUserWithTransaction("Hans", "1234");
		Result result = callPostAction(controllers.user.routes.ref.UserController.login(), postData("name", "Hans", "password", "0000"));
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
	}

	@Test
	public void testLogoutSuccessful() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("Hanss", "1234");
		//Test
		Result result = callActionWithUser(controllers.user.routes.ref.UserController.logout(), user);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		verifyLoggedIn(user, result, false);
	}

	@Test
	public void testRegisterSuccessful() {
		//Setup
		int userCountAtStart = USER_DAO.readAll().size();
		//Test
		Result result = callPostAction(controllers.user.routes.ref.UserController.register(), postData("name", "Hans3", "password", "0000", "password_repeat", "0000"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertThat(USER_DAO.readAll().size()).isEqualTo(userCountAtStart + 1);
		assertCheckJsonResponse(result, USER_LOGIC.getAsJson(USER_DAO.readByName("Hans3")));
	}

	@Test
	public void testRegisterWithDifferentPasswords() {
		//Setup
		int userCountAtStart = USER_DAO.readAll().size();
		//Test
		Result result = callPostAction(controllers.user.routes.ref.UserController.register(), postData("name", "Hans4", "password", "0000", "password_repeat", "1111"));
		//Verification
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
		assertThat(USER_DAO.readAll().size()).isEqualTo(userCountAtStart);
	}

	@Test
	public void testLoginStatusForUser() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("Hans Meier", "1234");
		//Test
		Result result = callActionWithUser(controllers.user.routes.ref.UserController.login_status(), user);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, USER_LOGIC.getAsJson(user));
	}

	@Test
	public void testLoginStatusForGuest() {
		//Test
		Result result = callAction(controllers.user.routes.ref.UserController.login_status());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertThat(contentAsString(result)).isEqualTo("{}");
	}

	@Test
	public void testChangePasswordSuccessful() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("Hans Meier 2", "2345");
		//Test
		Result result = callActionWithUser(routes.ref.UserController.changePassword(), user, postData("old_password", "2345", "new_password", "pw", "new_password_repeat", "pw"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertThat(status(callPostAction(controllers.user.routes.ref.UserController.login(), postData("name", "Hans Meier 2", "password", "pw")))).isEqualTo(OK); //login with new password works
	}

	@Test
	public void testChangePasswordWithWrongOldPassword() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("Hans Meier 3", "2345");
		//Test
		Result result = callActionWithUser(routes.ref.UserController.changePassword(), user, postData("old_password", "wrong pw", "new_password", "pw", "new_password_repeat", "pw"));
		//Verification
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
		assertThat(status(callPostAction(controllers.user.routes.ref.UserController.login(), postData("name", "Hans Meier 3", "password", "pw")))).isEqualTo(BAD_REQUEST); //login with new password works
	}

	@Test
	public void testChangePasswordWithDifferentNewPasswords() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("Hans Meier 4", "2345");
		//Test
		Result result = callActionWithUser(routes.ref.UserController.changePassword(), user, postData("old_password", "2345", "new_password", "pw1", "new_password_repeat", "pw2"));
		//Verification
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
		assertThat(status(callPostAction(controllers.user.routes.ref.UserController.login(), postData("name", "Hans Meier 4", "password", "pw")))).isEqualTo(BAD_REQUEST); //login with new password works
	}

}
