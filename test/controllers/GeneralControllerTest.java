package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.ppt.routes;
import daos.ppt.RequestTemplateDAO;
import daos.user.ProjectDAO;
import models.ppt.RequestTemplate;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.mvc.Result;
import play.test.FakeRequest;
import test.AbstractTestDataCreator;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.callAction;
import static play.test.Helpers.status;

public class GeneralControllerTest extends AbstractControllerTest {

	@Test
	public void testUpdateWithJsonRequest() throws Throwable {
		//Setup
		RequestTemplate requestTemplate = AbstractTestDataCreator.createRequestTemplateWithTransaction("My RequestTemplate", "My PPT", "My Project", "/example/target", "{}");
		JsonNode mappingAsJson = Json.parse("{ \"id\" : " + requestTemplate.getId() + ",\n" +
				"	\"name\":\"My RequestTemplate\",\n" +
				"	\"ppt\":{\"id\":" + requestTemplate.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + requestTemplate.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"url\" : \"/post/target2\",\n" +
				"	\"requestBodyTemplate\" : \"{\\\"name\\\":\\\"${titleeee}\\\"}\"\n" +
				"}");
		String user = AbstractTestDataCreator.createUserWithTransaction("User 77", "1234").getId() + "";
		//Test
		FakeRequest requestParams = new FakeRequest().withJsonBody(mappingAsJson).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user);
		Result result = callAction(routes.ref.RequestTemplateController.update(requestTemplate.getId()), requestParams);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, mappingAsJson);
		RequestTemplate requestTemplateInDB = JPA.withTransaction(() -> new RequestTemplateDAO().readById(requestTemplate.getId()));
		assertThat(requestTemplateInDB.getPpt().getId()).isEqualTo(requestTemplate.getPpt().getId());
		assertThat(requestTemplateInDB.getProject().getId()).isEqualTo(requestTemplate.getProject().getId());
		assertThat(requestTemplateInDB.getUrl()).isEqualTo("/post/target2");
		assertThat(requestTemplateInDB.getRequestBodyTemplate()).isEqualTo("{\"name\":\"${titleeee}\"}");
	}

	@Test
	public void testUpdateWithJsonRequestDoesNotUpdateReferencedItems() throws Throwable {
		//Setup
		RequestTemplate requestTemplate = AbstractTestDataCreator.createRequestTemplateWithTransaction("My Request Template", "My PPT", "My Project", "/example/target", "{}");
		Long oldProjectId = requestTemplate.getProject().getId();
		Long newProjectId = AbstractTestDataCreator.createProjectWithTransaction("New Project").getId();
		JsonNode mappingAsJson = Json.parse("{ \"id\" : " + requestTemplate.getId() + ",\n" +
				"	\"name\":\"My Request Template\",\n" +
				"	\"ppt\":{\"id\":" + requestTemplate.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + newProjectId + ",\"name\":\"JUST SOMETHING ELSE HERE\"},\n" +
				"	\"url\" : \"/post/target2\",\n" +
				"	\"requestBodyTemplate\" : \"{\\\"name\\\":\\\"${titleeee}\\\"}\"\n" +
				"}");
		String user = AbstractTestDataCreator.createUserWithTransaction("User 77", "1234").getId() + "";
		//Test
		FakeRequest requestParams = new FakeRequest().withJsonBody(mappingAsJson).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user);
		Result result = callAction(controllers.ppt.routes.ref.RequestTemplateController.update(requestTemplate.getId()), requestParams);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, mappingAsJson);
		RequestTemplate requestTemplateInDB = JPA.withTransaction(() -> new RequestTemplateDAO().readById(requestTemplate.getId()));
		assertThat(requestTemplateInDB.getProject().getId()).isEqualTo(newProjectId);
		assertThat(requestTemplateInDB.getProject().getName()).isEqualTo("New Project");
		assertThat(JPA.withTransaction(() -> new ProjectDAO().readById(oldProjectId)).getName()).isEqualToIgnoringCase("My Project");
		assertThat(JPA.withTransaction(() -> new ProjectDAO().readById(newProjectId)).getName()).isEqualToIgnoringCase("New Project");
	}

	@Test
	public void testUpdateWithJsonRequestDoNotRequireParametersButTheId() throws Throwable {
		//Setup
		RequestTemplate requestTemplate = AbstractTestDataCreator.createRequestTemplateWithTransaction("My Request Template", "My PPT", "My Project", "/example/target", "{}");
		Long newProjectId = AbstractTestDataCreator.createProjectWithTransaction("New Project").getId();
		JsonNode mappingAsJson = Json.parse("{ \"id\" : " + requestTemplate.getId() + ",\n" +
				"	\"name\":\"My Request Template\",\n" +
				"	\"ppt\":{\"id\":" + requestTemplate.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + newProjectId + "},\n" + //no name parameter here
				"	\"url\" : \"/post/target2\",\n" +
				"	\"requestBodyTemplate\" : \"{\\\"name\\\":\\\"${titleeee}\\\"}\"\n" +
				"}");
		String user = AbstractTestDataCreator.createUserWithTransaction("User 77", "1234").getId() + "";
		//Test
		FakeRequest requestParams = new FakeRequest().withJsonBody(mappingAsJson).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user);
		Result result = callAction(controllers.ppt.routes.ref.RequestTemplateController.update(requestTemplate.getId()), requestParams);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + requestTemplate.getId() + ",\n" +
				"	\"name\":\"My Request Template\",\n" +
				"	\"ppt\":{\"id\":" + requestTemplate.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + newProjectId + ",\"name\":null},\n" +
				"	\"url\" : \"/post/target2\",\n" +
				"	\"requestBodyTemplate\" : \"{\\\"name\\\":\\\"${titleeee}\\\"}\"\n" +
				"}"));
		RequestTemplate requestTemplateInDB = JPA.withTransaction(() -> new RequestTemplateDAO().readById(requestTemplate.getId()));
		assertThat(requestTemplateInDB.getProject().getId()).isEqualTo(newProjectId);
	}

}
