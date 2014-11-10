package controllers.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AbstractControllerTest;
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
import test.AbstractTestDataCreator;

import static org.fest.assertions.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.internal.verification.VerificationModeFactory.atLeastOnce;
import static org.powermock.api.mockito.PowerMockito.*;
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
		when(wsURL.post(Json.toJson(contentString))).thenReturn(F.Promise.promise(() -> response));

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
		String contentString = "{\"content\": \"Test content\"}";
		int resultStatus = 123;
		JsonNode resultJson = Json.parse("{\"result\":\"Check!\"}");

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.asJson()).thenReturn(resultJson);

		WSRequestHolder wsURL = spy(WS.url(baseUrl + urlPath));
		when(wsURL.post(Json.toJson(contentString))).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(baseUrl + urlPath)).thenReturn(wsURL);

		//Test
		Result result = callActionWithUser(routes.ref.ProjectPlanningToolController.createPPTTask(), user, postData("path", urlPath, "content", contentString, "account", account, "taskTemplate", taskTemplate.getId() + "", "project", project.getId() + "", "taskProperties[0]", taskProperty1.getId() + "-A value", "taskProperties[1]", taskProperty2.getId() + "-Another value"));

		//Verification
		assertThat(status(result)).isEqualTo(resultStatus);
		assertCheckJsonResponse(result, resultJson);

		verifyStatic(atLeastOnce());
		WS.url(baseUrl + urlPath);
		verify(wsURL).setAuth(username, password);

		Task task = JPA.withTransaction(() -> TASK_DAO.readAll().get(0));
		assertThat(task.getCreatedFrom().getId()).isEqualTo(taskTemplate.getId());
		assertThat(task.getFinalRequestContent()).isEqualTo("\"{\\\"content\\\": \\\"Test content\\\"}\"");
		assertThat(task.getFinalRequestUrl()).isEqualTo(baseUrl + urlPath);
		assertThat(Json.stringify(task.getFinalResponseContent())).isEqualTo("\"{\\\"result\\\":\\\"Check!\\\"}\"");
		assertThat(task.getFinalResponseStatus()).isEqualTo(resultStatus);
		assertThat(task.getProject().getId()).isEqualTo(project.getId());
		assertThat(task.getProperties()).hasSize(2);
	}


}
