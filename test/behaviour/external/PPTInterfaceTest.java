package external;

import daos.task.TaskDAO;
import daos.task.TaskPropertyValueDAO;
import logics.ppt.PPTTaskLogic;
import models.task.TaskTemplate;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.libs.ws.WSResponse;
import test.AbstractTestDataCreator;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.CREATED;

public class PPTInterfaceTest extends AbstractVagrantTest {

	public static final String VAGRANT_PATH = "test/tools/vagrants/PPT";
	public static final String JIRA_URL = "http://localhost:9920";

	@BeforeClass
	public static void startApp() {
		startAppWithVagrant(VAGRANT_PATH);
	}

	@AfterClass
	public static void stopApp() {
		stopAppWithVagrant(VAGRANT_PATH);
	}

	@Test
	public void testEverything() throws Throwable {
		checkIfVagrantTestsExcluded("integration.PPTIntegrationTest.testEverything");

		System.out.println("PPTIntegrationTest.testLoginStatusForUser: START");

		String projectKey = "TEST";

		//Create an issue
		{
			//Setup
			PPTTaskLogic.CreatePPTTaskForm form = new PPTTaskLogic.CreatePPTTaskForm();
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
			form.project = AbstractTestDataCreator.createProjectWithTransaction();
			form.taskTemplate = JPA.withTransaction(() -> {
				TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplate("My generated issue");
				AbstractTestDataCreator.createTaskPropertyValue("This is an issue, which is created by EEPPI over the API", "description", taskTemplate);
				AbstractTestDataCreator.createTaskPropertyValue("Task", "type", taskTemplate);
				flush();
				JPA.em().refresh(taskTemplate);
				return taskTemplate;
			});
			form.taskProperties = form.taskTemplate.getProperties();
			//Test
			WSResponse generatedTask = JPA.withTransaction(() -> new PPTTaskLogic(new TaskDAO(), new TaskPropertyValueDAO()).createPPTTaskOnRemoteServer(form, form.account));
			//Verification
			assertThat(generatedTask.getStatus()).isEqualTo(CREATED);
			assertThat(generatedTask.asJson().has("key")).isTrue();
		}

		System.out.println("PPTIntegrationTest.testLoginStatusForUser: END");
	}

}
