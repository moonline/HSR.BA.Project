package controllers.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AbstractControllerTest;
import controllers.AuthenticationChecker;
import daos.ppt.ProjectPlanningToolDAO;
import daos.task.TaskDAO;
import models.task.Task;
import models.task.TaskProperty;
import models.task.TaskTemplate;
import models.user.Project;
import models.user.User;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import play.db.jpa.JPA;
import play.libs.F;
import play.libs.Json;
import play.libs.ws.WS;
import play.libs.ws.WSRequestHolder;
import play.libs.ws.WSResponse;
import play.mvc.Result;
import play.test.FakeRequest;
import test.AbstractTestDataCreator;

import static org.fest.assertions.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.internal.verification.VerificationModeFactory.atLeastOnce;
import static org.powermock.api.mockito.PowerMockito.*;
import static play.mvc.Http.Status.*;
import static play.test.Helpers.callAction;
import static play.test.Helpers.status;


@RunWith(PowerMockRunner.class)
@PrepareForTest({WS.class, Json.class})
@PowerMockIgnore({"javax.management.*", "javax.crypto.*", "javax.net.ssl.*", "org.apache.http.conn.ssl.*"})
public class ProjectPlanningToolControllerTest extends AbstractControllerTest {

	public static final TaskDAO TASK_DAO = new TaskDAO();

	@Test
	public void testSendToPPTWithGoodData() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		String baseUrl = "http://localhost:1234";
		String urlPath = "/testPath";
		String username = "admin";
		String password = "1234";
		String account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, baseUrl, username, password).getId() + "";
		String contentString = "{\"content\": \"Test content\"}";
		int resultStatus = 123;
		JsonNode resultJson = Json.parse("{\"result\":\"Check!\"}");

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.asJson()).thenReturn(resultJson);

		WSRequestHolder wsURL = spy(WS.url(baseUrl + urlPath));
		when(wsURL.post(Json.parse(contentString))).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(baseUrl + urlPath)).thenReturn(wsURL);

		//Test
		Result result = callActionWithUser(routes.ref.ProjectPlanningToolController.sendToPPT(), user, postData("path", urlPath, "content", contentString, "account", account));

		//Verification
		assertThat(status(result)).isEqualTo(resultStatus);
		assertCheckJsonResponse(result, resultJson);

		verifyStatic(atLeastOnce());
		WS.url(baseUrl + urlPath);
		verify(wsURL).setAuth(username, password);
	}

	@Test
	public void createPPTTaskWithGoodData() throws Throwable {
		createPPTTaskWithGoodData(false);
	}

	@Test
	public void createPPTTaskWithGoodDataAsJsonRequest() throws Throwable {
		createPPTTaskWithGoodData(true);
	}

	private void createPPTTaskWithGoodData(boolean asJsonRequest) throws Throwable {
		//Setup
		JPA.withTransaction(TASK_DAO::removeAll);
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("The Task Template");
		TaskProperty taskProperty1 = AbstractTestDataCreator.createTaskPropertyWithTransaction("First Task Property");
		TaskProperty taskProperty2 = AbstractTestDataCreator.createTaskPropertyWithTransaction("Second Task Property");
		Project project = AbstractTestDataCreator.createProjectWithTransaction();
		String baseUrl = "http://localhost:1234";
		String urlPath = "/testPath";
		String username = "admin";
		String password = "1234";
		String account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, baseUrl, username, password).getId() + "";
		String contentString = "{\"content\":\"Test content\"}";
		int resultStatus = 123;
		JsonNode resultJson = Json.parse("{\"result\":\"Check!\"}");

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.asJson()).thenReturn(resultJson);

		WSRequestHolder wsURL = spy(WS.url(baseUrl + urlPath));
		when(wsURL.post(Json.parse(contentString))).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(baseUrl + urlPath)).thenReturn(wsURL);

		//Test
		Result result;
		if (asJsonRequest) {
			result = callAction(routes.ref.ProjectPlanningToolController.createPPTTask(), new FakeRequest().withJsonBody(Json.parse("{\n" +
					"	\"path\":\"" + urlPath + "\",\n" +
					"	\"content\":\"" + contentString.replaceAll("\"", "\\\\\\\"") + "\",\n" +
					"	\"account\":" + account + ",\n" +
					"	\"taskTemplate\":" + taskTemplate.getId() + ",\n" +
					"	\"project\":" + project.getId() + ",\n" +
					"	\"taskProperties\":[{\n" +
					"		\"property\":" + Json.stringify(Json.toJson(taskProperty1)) + ",\n" +
					"		\"value\":\"A value\"" +
					"	},{\n" +
					"		\"property\":" + Json.stringify(Json.toJson(taskProperty2)) + ",\n" +
					"		\"value\":\"Another value\"" +
					"	}]\n" +
					"}")).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user.getId() + ""));
		} else {
			result = callActionWithUser(routes.ref.ProjectPlanningToolController.createPPTTask(), user, postData("path", urlPath, "content", contentString, "account", account, "taskTemplate", taskTemplate.getId() + "", "project", project.getId() + "", "taskProperties[0]", taskProperty1.getId() + "-A value", "taskProperties[1]", taskProperty2.getId() + "-Another value"));
		}

		//Verification
		assertThat(status(result)).isEqualTo(resultStatus);
		assertCheckJsonResponse(result, resultJson);

		verifyStatic(atLeastOnce());
		WS.url(baseUrl + urlPath);
		verify(wsURL).setAuth(username, password);

		Task task = JPA.withTransaction(() -> TASK_DAO.readAll().get(0));
		assertThat(task.getCreatedFrom().getId()).isEqualTo(taskTemplate.getId());
		assertThat(task.getFinalRequestContent()).isEqualTo(contentString);
		assertThat(task.getFinalRequestUrl()).isEqualTo(baseUrl + urlPath);
		assertThat(Json.stringify(task.getFinalResponseContent())).isEqualTo("{\"result\":\"Check!\"}");
		assertThat(task.getFinalResponseStatus()).isEqualTo(resultStatus);
		assertThat(task.getProject().getId()).isEqualTo(project.getId());
		assertThat(task.getProperties()).hasSize(2);
	}

	@Test
	public void createPPTTaskWithUnresponsiveTarget() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_DAO::removeAll);
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("The Task Template");
		TaskProperty taskProperty1 = AbstractTestDataCreator.createTaskPropertyWithTransaction("First Task Property");
		TaskProperty taskProperty2 = AbstractTestDataCreator.createTaskPropertyWithTransaction("Second Task Property");
		Project project = AbstractTestDataCreator.createProjectWithTransaction();
		String baseUrl = "http://localhost:2345";
		String urlPath = "/testPath";
		String username = "admin";
		String password = "1234";
		String account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, baseUrl, username, password).getId() + "";
		String contentString = "{\"content\":\"Test content\"}";

		//Test
		Result result = callActionWithUser(routes.ref.ProjectPlanningToolController.createPPTTask(), user, postData("path", urlPath, "content", contentString, "account", account, "taskTemplate", taskTemplate.getId() + "", "project", project.getId() + "", "taskProperties[0]", taskProperty1.getId() + "-A value", "taskProperties[1]", taskProperty2.getId() + "-Another value"));

		//Verification
		assertThat(status(result)).isEqualTo(BAD_GATEWAY);
	}

	@Test
	public void createPPTTaskWithInvisibleTarget() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_DAO::removeAll);
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("The Task Template");
		TaskProperty taskProperty1 = AbstractTestDataCreator.createTaskPropertyWithTransaction("First Task Property");
		TaskProperty taskProperty2 = AbstractTestDataCreator.createTaskPropertyWithTransaction("Second Task Property");
		Project project = AbstractTestDataCreator.createProjectWithTransaction();
		String baseUrl = "http://192.168.253.253:3456";
		String urlPath = "/testPath";
		String username = "admin";
		String password = "1234";
		String account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, baseUrl, username, password).getId() + "";
		String contentString = "{\"content\":\"Test content\"}";

		//Test
		Result result = callActionWithUser(routes.ref.ProjectPlanningToolController.createPPTTask(), user, postData("path", urlPath, "content", contentString, "account", account, "taskTemplate", taskTemplate.getId() + "", "project", project.getId() + "", "taskProperties[0]", taskProperty1.getId() + "-A value", "taskProperties[1]", taskProperty2.getId() + "-Another value"));

		//Verification
		assertThat(status(result)).isIn(GATEWAY_TIMEOUT, BAD_GATEWAY);
	}

	@Test
	public void testReadTheSingleProject() throws Throwable {
		Result result = callActionWithUser(routes.ref.ProjectPlanningToolController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		Long pptId = JPA.withTransaction(() -> new ProjectPlanningToolDAO().readAll().get(0).getId());
		assertCheckJsonResponse(result, Json.parse("{\"items\":[{" +
				"	\"id\" : " + pptId + ",\n" +
				"	\"name\":\"Project Planning Tool\"\n" +
				"}]}"));
	}

	@Test
	public void createPPTTaskWithClientExampleRequest() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		String url = "http://localhost:9920/rest/api/2/issue";
		Long account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, "http://localhost:9920", "admin", "admin").getId();
		JsonNode requestContent = Json.parse("{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\"summary\": \"Define criterions\",\n \t\"description\": \".\\n\\nDecision: Session State Management\\nDKS link: http://localhost:9940/element/14\\nAttributes:\\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n \t\"duedate\": \"\",\n \t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n \t\"priority\": {\n\t\t\t\"name\": \"\"\n\t\t},\n \t\"assignee\": {\n\t\t\t\"name\": \"Project Planner\"\n\t\t},\n\t\t\"timetracking\": {\n\t\t\t\"originalEstimate\": \"\"\n\t\t}\n\t}\n}");
		int resultStatus = 123;
		JsonNode resultJson = Json.parse("{\"result\":\"Check!\"}");

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.asJson()).thenReturn(resultJson);

		WSRequestHolder wsURL = spy(WS.url(url));
		when(wsURL.post(requestContent)).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(url)).thenReturn(wsURL);

		//Test
		Result result = callAction(routes.ref.ProjectPlanningToolController.createPPTTask(), new FakeRequest().withJsonBody(Json.parse("{" +
				"	\"account\":{" +
				"		\"pptPassword\":null," +
				"		\"id\":" + account + "," +
				"		\"user\":{\"userName\":\"demo\",\"id\":3}," +
				"		\"pptUrl\":\"http://localhost:9920\"," +
				"		\"pptUsername\":\"admin\"," +
				"		\"ppt\":{\"id\":1,\"name\":\"Project Planning Tool\"}" +
				"	}," +
				"	\"path\":\"/rest/api/2/issue\"," +
				"	\"content\":\"" + Json.stringify(requestContent).replaceAll("\\\\", "\\\\\\\\").replaceAll("\"", "\\\\\"") + "\"," +
				"	\"taskTemplate\":{" +
				"		\"id\":11," +
				"		\"name\":\"Define criterions\"," +
				"		\"properties\":[" +
				"			{\"id\":12,\"property\":{\"id\":5,\"name\":\"Assignee\"},\"value\":\"Project Planner\"}," +
				"			{\"id\":13,\"property\":{\"id\":6,\"name\":\"Type\"},\"value\":\"Task\"}" +
				"		]," +
				"		\"attributes\":{\"assignee\":\"Project Planner\",\"type\":\"Task\"}" +
				"	}," +
				"	\"taskProperties\":[" +
				"		{\"id\":12,\"property\":{\"id\":5,\"name\":\"Assignee\"},\"value\":\"Project Planner\"}," +
				"		{\"id\":13,\"property\":{\"id\":6,\"name\":\"Type\"},\"value\":\"Task\"}" +
				"	]," +
				"	\"project\":{\"id\":2,\"name\":\"Project\"}" +
				"}")).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user.getId() + ""));

		//Verification
		assertThat(status(result)).isEqualTo(resultStatus);
		assertCheckJsonResponse(result, resultJson);

		verifyStatic(atLeastOnce());
		WS.url(url);

		Task task = JPA.withTransaction(() -> TASK_DAO.readAll().get(0));
		assertThat(task.getCreatedFrom().getId()).isEqualTo(11);
		assertThat(task.getFinalRequestUrl()).isEqualTo(url);
		assertThat(Json.stringify(task.getFinalResponseContent())).isEqualTo("{\"result\":\"Check!\"}");
		assertThat(task.getFinalResponseStatus()).isEqualTo(resultStatus);
		assertThat(task.getProject().getId()).isEqualTo(2);
		assertThat(task.getProperties()).hasSize(2);
	}

	@Test
	public void createPPTTaskWithoutAnyTaskProperties() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_DAO::removeAll);
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("The Task Template");
		Project project = AbstractTestDataCreator.createProjectWithTransaction();
		String baseUrl = "http://localhost:4321";
		String urlPath = "/testPath";
		String username = "admin";
		String password = "1234";
		String account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, baseUrl, username, password).getId() + "";
		String contentString = "{\"content\":\"Test content\"}";
		int resultStatus = 123;
		JsonNode resultJson = Json.parse("{\"result\":\"Check!\"}");

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.asJson()).thenReturn(resultJson);

		WSRequestHolder wsURL = spy(WS.url(baseUrl + urlPath));
		when(wsURL.post(Json.parse(contentString))).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(baseUrl + urlPath)).thenReturn(wsURL);

		//Test
		Result result;
		result = callAction(routes.ref.ProjectPlanningToolController.createPPTTask(), new FakeRequest().withJsonBody(Json.parse("{\n" +
				"	\"path\":\"" + urlPath + "\",\n" +
				"	\"content\":\"" + contentString.replaceAll("\"", "\\\\\\\"") + "\",\n" +
				"	\"account\":" + account + ",\n" +
				"	\"taskTemplate\":" + taskTemplate.getId() + ",\n" +
				"	\"project\":" + project.getId() + ",\n" +
				"	\"taskProperties\":[]\n" +
				"}")).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user.getId() + ""));

		//Verification
		assertThat(status(result)).isEqualTo(resultStatus);
		assertCheckJsonResponse(result, resultJson);

		verifyStatic(atLeastOnce());
		WS.url(baseUrl + urlPath);
		verify(wsURL).setAuth(username, password);

		Task task = JPA.withTransaction(() -> TASK_DAO.readAll().get(0));
		assertThat(task.getCreatedFrom().getId()).isEqualTo(taskTemplate.getId());
		assertThat(task.getFinalRequestContent()).isEqualTo(contentString);
		assertThat(task.getFinalRequestUrl()).isEqualTo(baseUrl + urlPath);
		assertThat(Json.stringify(task.getFinalResponseContent())).isEqualTo("{\"result\":\"Check!\"}");
		assertThat(task.getFinalResponseStatus()).isEqualTo(resultStatus);
		assertThat(task.getProject().getId()).isEqualTo(project.getId());
		assertThat(task.getProperties()).isEmpty();
	}


}
