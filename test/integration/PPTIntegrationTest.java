package integration;

import daos.task.TaskDAO;
import daos.task.TaskPropertyValueDAO;
import logics.ppt.PPTTaskLogic;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import play.libs.Json;
import play.libs.ws.WSResponse;
import test.AbstractTestDataCreator;

import java.io.File;
import java.io.IOException;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.CREATED;

public class PPTIntegrationTest extends AbstractIntegrationTest {

	public static final String VAGRANT_PATH = "test/integration/PPT";
	public static final String JIRA_URL = "http://localhost:9920";

	@BeforeClass
	public static void startApp() {
		if (integrationTestsExcluded()) {
			return;
		}
		AbstractIntegrationTest.startApp();
		try {
			Runtime.getRuntime().exec("vagrant up", null, new File(PPTIntegrationTest.VAGRANT_PATH)).waitFor();
		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
	}

	@AfterClass
	public static void stopApp() {
		if (integrationTestsExcluded()) {
			return;
		}
		try {
			Runtime.getRuntime().exec("vagrant destroy -f", null, new File(VAGRANT_PATH)).waitFor();
		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
		AbstractIntegrationTest.stopApp();
	}

	@Test
	public void testEverything() throws Throwable {
		if (integrationTestsExcluded("integration.PPTIntegrationTest.testEverything")) {
			return;
		}
		System.out.println("PPTIntegrationTest.testLoginStatusForUser: START");

		String projectKey = "TEST";

		//Create an issue
		{
			//Setup
			PPTTaskLogic.CreatePPTTaskWithoutStoringForm form = new PPTTaskLogic.CreatePPTTaskWithoutStoringForm();
			form.account = AbstractTestDataCreator.createPPTAccountWithTransaction(AbstractTestDataCreator.createUserWithTransaction("Admin", "123"), JIRA_URL, "admin", "admin");
			form.path = "/rest/api/2/issue/";
			form.content = Json.parse("{\n" +
					"    \"fields\": {\n" +
					"       \"project\":\n" +
					"       {\n" +
					"          \"key\": \"" + projectKey + "\"\n" +
					"       },\n" +
					"       \"summary\": \"My generated issue\",\n" +
					"       \"description\": \"This is an issue, which is created by EEPPI over the API\",\n" +
					"       \"issuetype\": {\n" +
					"          \"name\": \"Task\"\n" +
					"       }\n" +
					"   }\n" +
					"}");
			//Test
			WSResponse response = new PPTTaskLogic(new TaskDAO(), new TaskPropertyValueDAO()).createPPTTaskWithoutStoring(form);
			//Verification
			assertThat(response.getStatus()).isEqualTo(CREATED);
			assertThat(response.asJson().has("key")).isTrue();
		}

		System.out.println("PPTIntegrationTest.testLoginStatusForUser: END");
	}

}
