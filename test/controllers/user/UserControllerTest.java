package controllers.user;

import controllers.AbstractControllerTest;
import controllers.AbstractTestDataCreator;
import org.junit.Test;
import play.mvc.Result;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.BAD_REQUEST;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.callAction;
import static play.test.Helpers.status;

public class UserControllerTest extends AbstractControllerTest {

	@Test
	public void testLoginWithoutParams() {
		Result result = callAction(controllers.user.routes.ref.UserController.login());
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
	}

	@Test
	public void testLoginSuccessful() throws Throwable {
		AbstractTestDataCreator.createUserWithTransaction("Hans", "1234");
		Result result = callPostAction(controllers.user.routes.ref.UserController.login(), "name", "Hans", "password", "1234");
		assertThat(status(result)).isEqualTo(OK);
	}

	@Test
	public void testLoginWithBadPassword() throws Throwable {
		AbstractTestDataCreator.createUserWithTransaction("Hans", "1234");
		Result result = callPostAction(controllers.user.routes.ref.UserController.login(), "name", "Hans", "password", "0000");
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
	}


}
