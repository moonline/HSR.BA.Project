package controllers.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AbstractControllerTest;
import controllers.AuthenticationChecker;
import daos.ppt.ProjectPlanningToolDAO;
import daos.task.TaskDAO;
import models.task.Task;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;
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
import static play.mvc.Http.Status.BAD_GATEWAY;
import static play.mvc.Http.Status.GATEWAY_TIMEOUT;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.*;


@RunWith(PowerMockRunner.class)
@PrepareForTest({WS.class, Json.class})
@PowerMockIgnore({"javax.management.*", "javax.crypto.*", "javax.net.ssl.*", "org.apache.http.conn.ssl.*"})
public class ProjectPlanningToolControllerTest extends AbstractControllerTest {

	public static final TaskDAO TASK_DAO = new TaskDAO();

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
		when(response.getHeader("Content-Type")).thenReturn("application/json; charset=utf-8");
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
		verify(wsURL, atLeastOnce()).setAuth(username, password);

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
		JPA.withTransaction(TASK_DAO::removeAll);
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		String url = "http://localhost:9920/rest/api/2/issue";
		Long account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, "http://localhost:9920", "admin", "admin").getId();
		TaskPropertyValue[] taskPropertyValues = JPA.withTransaction(() -> {
			TaskTemplate newTaskTemplate = AbstractTestDataCreator.createTaskTemplate("Define criterions");
			return new TaskPropertyValue[]{
					AbstractTestDataCreator.createTaskPropertyValue("Assignee", "Project Planner", newTaskTemplate),
					AbstractTestDataCreator.createTaskPropertyValue("Task", "Type", newTaskTemplate)
			};
		});
		JsonNode requestContent = Json.parse("{\n\t\"fields\": {\n\t\t\"project\": {\n\t\t\t\"key\": \"TEST\"\n\t\t},\n\t\t\"summary\": \"Define criterions\",\n \t\"description\": \".\\n\\nDecision: Session State Management\\nDKS link: http://localhost:9940/element/14\\nAttributes:\\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n \t\"duedate\": \"\",\n \t\"issuetype\": {\n\t\t\t\"name\": \"Task\"\n\t\t},\n \t\"priority\": {\n\t\t\t\"name\": \"\"\n\t\t},\n \t\"assignee\": {\n\t\t\t\"name\": \"Project Planner\"\n\t\t},\n\t\t\"timetracking\": {\n\t\t\t\"originalEstimate\": \"\"\n\t\t}\n\t}\n}");
		int resultStatus = 123;
		JsonNode resultJson = Json.parse("{\"result\":\"Check!\"}");

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.getHeader("Content-Type")).thenReturn("application/json; charset=utf-8");
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
				"		\"id\":" + taskPropertyValues[0].getTask().getId() + "," +
				"		\"name\":\"Define criterions\"," +
				"		\"properties\":[" +
				"			{\"id\":" + taskPropertyValues[0].getId() + ",\"property\":{\"id\":" + taskPropertyValues[0].getProperty().getId() + ",\"name\":\"Assignee\"},\"value\":\"Project Planner\"}," +
				"			{\"id\":" + taskPropertyValues[1].getId() + ",\"property\":{\"id\":" + taskPropertyValues[1].getProperty().getId() + ",\"name\":\"Type\"},\"value\":\"Task\"}" +
				"		]," +
				"		\"attributes\":{\"assignee\":\"Project Planner\",\"type\":\"Task\"}" +
				"	}," +
				"	\"taskProperties\":[" +
				"		{\"id\":" + taskPropertyValues[0].getId() + "" + taskPropertyValues[0].getId() + ",\"property\":{\"id\":" + taskPropertyValues[0].getProperty().getId() + ",\"name\":\"Assignee\"},\"value\":\"Project Planner\"}," +
				"		{\"id\":" + taskPropertyValues[1].getId() + "" + taskPropertyValues[1].getId() + ",\"property\":{\"id\":" + taskPropertyValues[1].getProperty().getId() + ",\"name\":\"Type\"},\"value\":\"Task\"}" +
				"	]," +
				"	\"project\":{\"id\":2,\"name\":\"Project\"}" +
				"}")).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user.getId() + ""));

		//Verification
		assertThat(status(result)).isEqualTo(resultStatus);
		assertCheckJsonResponse(result, resultJson);

		verifyStatic(atLeastOnce());
		WS.url(url);

		Task task = JPA.withTransaction(() -> TASK_DAO.readAll().get(0));
		assertThat(task.getCreatedFrom().getId()).isEqualTo(taskPropertyValues[0].getTask().getId());
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
		when(response.getHeader("Content-Type")).thenReturn("application/json; charset=utf-8");
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
		verify(wsURL, atLeastOnce()).setAuth(username, password);

		Task task = JPA.withTransaction(() -> TASK_DAO.readAll().get(0));
		assertThat(task.getCreatedFrom().getId()).isEqualTo(taskTemplate.getId());
		assertThat(task.getFinalRequestContent()).isEqualTo(contentString);
		assertThat(task.getFinalRequestUrl()).isEqualTo(baseUrl + urlPath);
		assertThat(Json.stringify(task.getFinalResponseContent())).isEqualTo("{\"result\":\"Check!\"}");
		assertThat(task.getFinalResponseStatus()).isEqualTo(resultStatus);
		assertThat(task.getProject().getId()).isEqualTo(project.getId());
		assertThat(task.getProperties()).isEmpty();
	}

	@Test
	public void createPPTTaskOnRedmine() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_DAO::removeAll);
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		String url = "http://localhost:9930/issues.json";
		Long account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, "http://localhost:9930", "admin", "admin").getId();
		TaskPropertyValue[] taskPropertyValues = JPA.withTransaction(() -> {
			TaskTemplate newTaskTemplate = AbstractTestDataCreator.createTaskTemplate("Define criterions");
			return new TaskPropertyValue[]{
					AbstractTestDataCreator.createTaskPropertyValue("Customer", "Assignee", newTaskTemplate),
					AbstractTestDataCreator.createTaskPropertyValue("Task", "Type", newTaskTemplate)
			};
		});
		JsonNode requestContent = Json.parse("{\n\t\"issue\": {\n\t\t\"project_id\": \"test\",\n\t\t\n\t\t\"subject\": \"Rank criterions\",\n\t\t\"description\": \" \\nDecision: DB Model \\nDKS link: http://localhost:9940/element/16 \\nAttributes: \\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n\t\t\"assigned_to_id\": 1,\n\t\t\"tracker_id\": 3\n\t}\n}");
		int resultStatus = 123;
		String resultString = "{\"issue\":{\"id\":7,\"project\":{\"id\":1,\"name\":\"Test Projekt\"},\"tracker\":{\"id\":3,\"name\":\"Support\"},\"status\":{\"id\":1,\"name\":\"New\"},\"priority\":{\"id\":2,\"name\":\"Normal\"},\"author\":{\"id\":1,\"name\":\"Redmine Admin\"},\"assigned_to\":{\"id\":1,\"name\":\"Redmine Admin\"},\"subject\":\"Rank criterions\",\"description\":\" \\r\\nDecision: DB Model \\r\\nDKS link: http://localhost:9940/element/16 \\r\\nAttributes: \\r\\nRevision Date: 2016-11-11\\r\\nViewpoint: Scenario\\r\\nIntellectual Property Rights: Unrestricted\\r\\nDue Date: 2014-12-24\\r\\nProject Stage: Inception\\r\\nOrganisational Reach: Project\\r\\nStakeholder Roles: Any\\r\\nOwner Role: Lead Architect\",\"start_date\":\"2014-12-03\",\"done_ratio\":0,\"spent_hours\":0.0,\"created_on\":\"2014-12-03T16:06:09Z\",\"updated_on\":\"2014-12-03T16:06:09Z\"}}";
		JsonNode resultJson = Json.parse(resultString);

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.getHeader("Content-Type")).thenReturn("application/json; charset=utf-8");
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
				"		\"user\":{\"userName\":null}," +
				"		\"pptUrl\":\"http://localhost:9930\"," +
				"		\"pptUsername\":\"admin\"," +
				"		\"ppt\":{\"id\":47,\"name\":\"Project Planning Tool\"}" +
				"	}," +
				"	\"path\":\"/issues.json\"," +
				"	\"content\":\"{\\n\\t\\\"issue\\\": {\\n\\t\\t\\\"project_id\\\": \\\"test\\\",\\n\\t\\t\\n\\t\\t\\\"subject\\\": \\\"Rank criterions\\\",\\n\\t\\t\\\"description\\\": \\\" \\\\nDecision: DB Model \\\\nDKS link: http://localhost:9940/element/16 \\\\nAttributes: \\\\nRevision Date: 2016-11-11\\\\nViewpoint: Scenario\\\\nIntellectual Property Rights: Unrestricted\\\\nDue Date: 2014-12-24\\\\nProject Stage: Inception\\\\nOrganisational Reach: Project\\\\nStakeholder Roles: Any\\\\nOwner Role: Lead Architect\\\",\\n\\t\\t\\\"assigned_to_id\\\": 1,\\n\\t\\t\\\"tracker_id\\\": 3\\n\\t}\\n}\"," +
				"	\"taskTemplate\":{" +
				"		\"id\":" + taskPropertyValues[0].getTask().getId() + "," +
				"		\"name\":\"Rank criterions\"," +
				"		\"properties\":[" +
				"			{\"id\":" + taskPropertyValues[0].getId() + ",\"property\":{\"id\":" + taskPropertyValues[0].getProperty().getId() + ",\"name\":\"Assignee\"},\"value\":\"Customer\"}," +
				"			{\"id\":" + taskPropertyValues[1].getId() + ",\"property\":{\"id\":" + taskPropertyValues[1].getProperty().getId() + ",\"name\":\"Type\"},\"value\":\"Task\"}]," +
				"		\"parent\":null," +
				"		\"attributes\":{\"Assignee\":\"Customer\",\"Type\":\"Task\"}" +
				"	}," +
				"	\"taskProperties\":[" +
				"		{\"id\":" + taskPropertyValues[0].getId() + ",\"property\":{\"id\":" + taskPropertyValues[0].getProperty().getId() + ",\"name\":\"Assignee\"},\"value\":\"Customer\"}," +
				"		{\"id\":" + taskPropertyValues[1].getId() + ",\"property\":{\"id\":" + taskPropertyValues[1].getProperty().getId() + ",\"name\":\"Type\"},\"value\":\"Task\"}" +
				"	]," +
				"	\"project\":{\"id\":2,\"name\":\"Project\"}" +
				"}")).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user.getId() + ""));

		//Verification
		assertThat(status(result)).isEqualTo(resultStatus);
		assertCheckJsonResponse(result, resultJson);

		verifyStatic(atLeastOnce());
		WS.url(url);

		Task task = JPA.withTransaction(() -> TASK_DAO.readAll().get(0));
		assertThat(task.getCreatedFrom().getId()).describedAs("createdFrom").isEqualTo(taskPropertyValues[0].getTask().getId());
		assertThat(task.getFinalRequestUrl()).isEqualTo(url);
		assertThat(Json.stringify(task.getFinalResponseContent())).isEqualTo(resultString);
		assertThat(task.getFinalResponseStatus()).describedAs("status").isEqualTo(resultStatus);
		assertThat(task.getProject().getId()).describedAs("project").isEqualTo(2);
		assertThat(task.getProperties()).describedAs("properties").hasSize(2);
	}

	@Test
	public void survivingRequestsToAPPTReturningNoJson() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_DAO::removeAll);
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		String url = "http://localhost:9930/issues.json";
		Long account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, "http://localhost:9930", "admin", "admin").getId();
		TaskPropertyValue[] taskPropertyValues = JPA.withTransaction(() -> {
			TaskTemplate newTaskTemplate = AbstractTestDataCreator.createTaskTemplate("Define criterions");
			return new TaskPropertyValue[]{
					AbstractTestDataCreator.createTaskPropertyValue("Customer", "Assignee", newTaskTemplate),
					AbstractTestDataCreator.createTaskPropertyValue("Task", "Type", newTaskTemplate)
			};
		});
		JsonNode requestContent = Json.parse("{\n\t\"issue\": {\n\t\t\"project_id\": \"test\",\n\t\t\n\t\t\"subject\": \"Rank criterions\",\n\t\t\"description\": \" \\nDecision: DB Model \\nDKS link: http://localhost:9940/element/16 \\nAttributes: \\nRevision Date: 2016-11-11\\nViewpoint: Scenario\\nIntellectual Property Rights: Unrestricted\\nDue Date: 2014-12-24\\nProject Stage: Inception\\nOrganisational Reach: Project\\nStakeholder Roles: Any\\nOwner Role: Lead Architect\",\n\t\t\"assigned_to_id\": 1,\n\t\t\"tracker_id\": 3\n\t}\n}");
		int resultStatus = 123;

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.getHeader("Content-Type")).thenReturn("text/html; charset=utf-8");
		when(response.asJson()).thenThrow(new RuntimeException());
		String resultString = "<html><head></head><body>...</body></html>";
		when(response.getBody()).thenReturn(resultString);

		WSRequestHolder wsURL = spy(WS.url(url));
		when(wsURL.post(requestContent)).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(url)).thenReturn(wsURL);

		//Test
		Result result = callAction(routes.ref.ProjectPlanningToolController.createPPTTask(), new FakeRequest().withJsonBody(Json.parse("{" +
				"	\"account\":{" +
				"		\"pptPassword\":null," +
				"		\"id\":" + account + "," +
				"		\"user\":{\"userName\":null}," +
				"		\"pptUrl\":\"http://localhost:9930\"," +
				"		\"pptUsername\":\"admin\"," +
				"		\"ppt\":{\"id\":47,\"name\":\"Project Planning Tool\"}" +
				"	}," +
				"	\"path\":\"/issues.json\"," +
				"	\"content\":\"{\\n\\t\\\"issue\\\": {\\n\\t\\t\\\"project_id\\\": \\\"test\\\",\\n\\t\\t\\n\\t\\t\\\"subject\\\": \\\"Rank criterions\\\",\\n\\t\\t\\\"description\\\": \\\" \\\\nDecision: DB Model \\\\nDKS link: http://localhost:9940/element/16 \\\\nAttributes: \\\\nRevision Date: 2016-11-11\\\\nViewpoint: Scenario\\\\nIntellectual Property Rights: Unrestricted\\\\nDue Date: 2014-12-24\\\\nProject Stage: Inception\\\\nOrganisational Reach: Project\\\\nStakeholder Roles: Any\\\\nOwner Role: Lead Architect\\\",\\n\\t\\t\\\"assigned_to_id\\\": 1,\\n\\t\\t\\\"tracker_id\\\": 3\\n\\t}\\n}\"," +
				"	\"taskTemplate\":{" +
				"		\"id\":" + taskPropertyValues[0].getTask().getId() + "," +
				"		\"name\":\"Rank criterions\"," +
				"		\"properties\":[" +
				"			{\"id\":" + taskPropertyValues[0].getId() + ",\"property\":{\"id\":" + taskPropertyValues[0].getProperty().getId() + ",\"name\":\"Assignee\"},\"value\":\"Customer\"}," +
				"			{\"id\":" + taskPropertyValues[1].getId() + ",\"property\":{\"id\":" + taskPropertyValues[1].getProperty().getId() + ",\"name\":\"Type\"},\"value\":\"Task\"}]," +
				"		\"parent\":null," +
				"		\"attributes\":{\"Assignee\":\"Customer\",\"Type\":\"Task\"}" +
				"	}," +
				"	\"taskProperties\":[" +
				"		{\"id\":" + taskPropertyValues[0].getId() + ",\"property\":{\"id\":" + taskPropertyValues[0].getProperty().getId() + ",\"name\":\"Assignee\"},\"value\":\"Customer\"}," +
				"		{\"id\":" + taskPropertyValues[1].getId() + ",\"property\":{\"id\":" + taskPropertyValues[1].getProperty().getId() + ",\"name\":\"Type\"},\"value\":\"Task\"}" +
				"	]," +
				"	\"project\":{\"id\":2,\"name\":\"Project\"}" +
				"}")).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user.getId() + ""));

		//Verification
		assertThat(headers(result).get("Content-Type")).startsWith("application/json");
		assertThat(status(result)).isEqualTo(resultStatus);
		assertCheckJsonResponse(result, Json.parse("{\"content\": \"" + resultString + "\", \"type\": \"text/html; charset=utf-8\"}"));
	}

}
