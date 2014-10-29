package controllers.user;

import controllers.AbstractControllerTest;
import daos.user.PPTAccountDAO;
import models.ppt.ProjectPlanningTool;
import models.user.PPTAccount;
import models.user.User;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.mvc.Result;

import java.util.List;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.*;
import static play.test.Helpers.status;
import static test.AbstractTestDataCreator.*;

public class PPTAccountControllerTest extends AbstractControllerTest {

	public static final PPTAccountDAO PPT_ACCOUNT_DAO = new PPTAccountDAO();

	@Test
	public void testCreatePPTAccountWorking() throws Throwable {
		//Setup
		JPA.withTransaction(PPT_ACCOUNT_DAO::removeAll);
		ProjectPlanningTool ppt = createProjectPlanningToolWithTransaction();
		User user = createUserWithTransaction("User 9", "123");
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.create(), user, postData(
				"ppt", ppt.getId() + "",
				"url", "http://example.com",
				"pptUsername", "my username",
				"pptPassword", "123456"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		//noinspection Convert2MethodRef
		List<PPTAccount> pptAccounts = JPA.withTransaction(() -> PPT_ACCOUNT_DAO.readAll());
		assertThat(pptAccounts).hasSize(1);
		PPTAccount pptAccount = pptAccounts.get(0);
		assertThat(pptAccount.getUser().getId()).isEqualTo(user.getId());
		assertThat(pptAccount.getPpt().getId()).isEqualTo(ppt.getId());
		assertThat(pptAccount.getPptUrl()).isEqualTo("http://example.com");
		assertThat(pptAccount.getPptUsername()).isEqualTo("my username");
		assertThat(pptAccount.getPptPassword()).isEqualTo("123456");
	}

	@Test
	public void testCreatePPTAccountWithoutPassword() throws Throwable {
		//Setup
		ProjectPlanningTool ppt = createProjectPlanningToolWithTransaction();
		User user = createUserWithTransaction("User 9", "123");
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.create(), user, postData(
				"ppt", ppt.getId() + "",
				"url", "http://example.com",
				"pptUsername", "my username"));
		//Verification
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
	}

	@Test
	public void testCreatePPTAccountWithBadData() throws Throwable {
		//Setup
		User user = createUserWithTransaction("User 9", "123");
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.create(), user, postData(
				"ppt", "9999",
				"url", "http://example.com",
				"pptUsername", "my username",
				"pptPassword", "123456"));
		//Verification
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
		assertCheckJsonResponse(result, Json.parse("{\"ppt\":[\"Invalid value\"]}"));
	}

	@Test
	public void testReadAllPPTAccounts() throws Throwable {
		//Setup
		User user = createUserWithTransaction("User 9", "123");
		PPTAccount account1 = createPPTAccountWithTransaction(user, "http://example1.com", "admin", "1234");
		PPTAccount account2 = createPPTAccountWithTransaction(user, "http://example2.com", "admin", "12345");
		createPPTAccountWithTransaction(createUserWithTransaction("User", "123"), "http://example3.com", "admin", "1234");
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.readAll(), user);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("[ { \"id\" : " + account1.getId() + ",\n" +
				"      \"ppt\" : null,\n" +
				"      \"pptUrl\" : \"http://example1.com\",\n" +
				"      \"user\" : { \"id\" : " + user.getId() + ",\n" +
				"          \"name\" : \"User 9\"\n" +
				"        },\n" +
				"      \"pptUsername\" : \"admin\"\n" +
				"    },\n" +
				"    { \"id\" : " + account2.getId() + ",\n" +
				"      \"ppt\" : null,\n" +
				"      \"pptUrl\" : \"http://example2.com\",\n" +
				"      \"user\" : " + user.getId() + ",\n" +
				"      \"pptUsername\" : \"admin\"\n" +
				"    }\n" +
				"  ]"));
	}


	@Test
	public void testReadOnePPTAccounts() throws Throwable {
		//Setup
		User user = createUserWithTransaction("User 9", "123");
		PPTAccount account = createPPTAccountWithTransaction(user, "http://example1.com", "admin", "1234");
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.readOne(account.getId()), user);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + account.getId() + ",\n" +
				"      \"ppt\" : null,\n" +
				"      \"pptUrl\" : \"http://example1.com\",\n" +
				"      \"user\" : {\"id\":" + user.getId() + ",\"name\":\"User 9\"},\n" +
				"      \"pptUsername\" : \"admin\"" +
				"    }"));
	}

	@Test
	public void testReadOnePPTAccountsForOtherUser() throws Throwable {
		//Setup
		PPTAccount account = createPPTAccountWithTransaction(createUserWithTransaction("User 9", "123"), "http://example1.com", "admin", "1234");
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.readOne(account.getId()));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
	}

	@Test
	public void testUpdatePPTAccountWorking() throws Throwable {
		//Setup
		User user = createUserWithTransaction("User 9", "123");
		PPTAccount account = createPPTAccountWithTransaction(user, "http://example.com", "admin", "1234");
		ProjectPlanningTool ppt = createProjectPlanningToolWithTransaction();
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.update(account.getId()), user, postData(
				"ppt", ppt.getId() + "",
				"url", "http://another-example.com",
				"pptUsername", "my new username",
				"pptPassword", "more secure"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + account.getId() + ",\n" +
				"      \"ppt\" :{\"id\":" + ppt.getId() + ",\"name\":\"My Project Planning Tool\"},\n" +
				"      \"pptUrl\" : \"http://another-example.com\",\n" +
				"      \"user\" : {\"id\":" + user.getId() + ",\"name\":\"User 9\"},\n" +
				"      \"pptUsername\" : \"my new username\"" +
				"    }"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		PPTAccount pptAccount = JPA.withTransaction(() -> PPT_ACCOUNT_DAO.readById(account.getId()));
		assertThat(pptAccount.getUser().getId()).isEqualTo(user.getId());
		assertThat(pptAccount.getPpt().getId()).isEqualTo(ppt.getId());
		assertThat(pptAccount.getPptUrl()).isEqualTo("http://another-example.com");
		assertThat(pptAccount.getPptUsername()).isEqualTo("my new username");
		assertThat(pptAccount.getPptPassword()).isEqualTo("more secure");
	}

	@Test
	public void testUpdatePPTAccountButNotItsPassword() throws Throwable {
		//Setup
		User user = createUserWithTransaction("User 9", "123");
		PPTAccount account = createPPTAccountWithTransaction(user, "http://example.com", "admin", "1234");
		ProjectPlanningTool ppt = createProjectPlanningToolWithTransaction();
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.update(account.getId()), user, postData(
				"ppt", ppt.getId() + "",
				"url", "http://another-example.com",
				"pptUsername", "my new username"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + account.getId() + ",\n" +
				"      \"ppt\" :{\"id\":" + ppt.getId() + ",\"name\":\"My Project Planning Tool\"},\n" +
				"      \"pptUrl\" : \"http://another-example.com\",\n" +
				"      \"user\" : {\"id\":" + user.getId() + ",\"name\":\"User 9\"},\n" +
				"      \"pptUsername\" : \"my new username\"" +
				"    }"));
		PPTAccount pptAccount = JPA.withTransaction(() -> PPT_ACCOUNT_DAO.readById(account.getId()));
		assertThat(pptAccount.getUser().getId()).isEqualTo(user.getId());
		assertThat(pptAccount.getPpt().getId()).isEqualTo(ppt.getId());
		assertThat(pptAccount.getPptUrl()).isEqualTo("http://another-example.com");
		assertThat(pptAccount.getPptUsername()).isEqualTo("my new username");
		assertThat(pptAccount.getPptPassword()).isEqualTo("1234");
	}

	@Test
	public void testDeletePPTAccount() throws Throwable {
		//Setup
		User user = createUserWithTransaction("User 9", "123");
		PPTAccount account = createPPTAccountWithTransaction(user, "http://example.com", "admin", "1234");
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.delete(account.getId()), user);
		//Verification
		assertThat(status(result)).isEqualTo(NO_CONTENT);
		assertThat(JPA.withTransaction(() -> PPT_ACCOUNT_DAO.readById(account.getId()))).isNull();
	}

	@Test
	public void testDeletePPTAccountWithWrongUser() throws Throwable {
		//Setup
		PPTAccount account = createPPTAccountWithTransaction(createUserWithTransaction("User 9", "123"), "http://example.com", "admin", "1234");
		//Test
		Result result = callActionWithUser(routes.ref.PPTAccountController.delete(account.getId()), createUserWithTransaction("Another User", "abc"));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
		assertThat(JPA.withTransaction(() -> PPT_ACCOUNT_DAO.readById(account.getId()))).isNotNull();
	}


}
