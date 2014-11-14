package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import daos.ppt.MappingDAO;
import daos.user.ProjectDAO;
import models.ppt.Mapping;
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
		Mapping mapping = AbstractTestDataCreator.createMappingWithTransaction("My PPT", "My Project", "/example/target", "{}");
		JsonNode mappingAsJson = Json.parse("{ \"id\" : " + mapping.getId() + ",\n" +
				"	\"projectPlanningTool\":{\"id\":" + mapping.getProjectPlanningTool().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + mapping.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"url\" : \"/post/target2\",\n" +
				"	\"requestTemplate\" : \"{\\\"name\\\":\\\"${titleeee}\\\"}\"\n" +
				"}");
		String user = AbstractTestDataCreator.createUserWithTransaction("User 77", "1234").getId() + "";
		//Test
		FakeRequest requestParams = new FakeRequest().withJsonBody(mappingAsJson).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user);
		Result result = callAction(controllers.ppt.routes.ref.MappingController.update(mapping.getId()), requestParams);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, mappingAsJson);
		Mapping mappingInDB = JPA.withTransaction(() -> new MappingDAO().readById(mapping.getId()));
		assertThat(mappingInDB.getProjectPlanningTool().getId()).isEqualTo(mapping.getProjectPlanningTool().getId());
		assertThat(mappingInDB.getProject().getId()).isEqualTo(mapping.getProject().getId());
		assertThat(mappingInDB.getUrl()).isEqualTo("/post/target2");
		assertThat(mappingInDB.getRequestTemplate()).isEqualTo("{\"name\":\"${titleeee}\"}");
	}

	@Test
	public void testUpdateWithJsonRequestDoesNotUpdateReferencedItems() throws Throwable {
		//Setup
		Mapping mapping = AbstractTestDataCreator.createMappingWithTransaction("My PPT", "My Project", "/example/target", "{}");
		Long oldProjectId = mapping.getProject().getId();
		Long newProjectId = AbstractTestDataCreator.createProjectWithTransaction("New Project").getId();
		JsonNode mappingAsJson = Json.parse("{ \"id\" : " + mapping.getId() + ",\n" +
				"	\"projectPlanningTool\":{\"id\":" + mapping.getProjectPlanningTool().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + newProjectId + ",\"name\":\"JUST SOMETHING ELSE HERE\"},\n" +
				"	\"url\" : \"/post/target2\",\n" +
				"	\"requestTemplate\" : \"{\\\"name\\\":\\\"${titleeee}\\\"}\"\n" +
				"}");
		String user = AbstractTestDataCreator.createUserWithTransaction("User 77", "1234").getId() + "";
		//Test
		FakeRequest requestParams = new FakeRequest().withJsonBody(mappingAsJson).withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user);
		Result result = callAction(controllers.ppt.routes.ref.MappingController.update(mapping.getId()), requestParams);
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, mappingAsJson);
		Mapping mappingInDB = JPA.withTransaction(() -> new MappingDAO().readById(mapping.getId()));
		assertThat(mappingInDB.getProject().getId()).isEqualTo(newProjectId);
		assertThat(mappingInDB.getProject().getName()).isEqualTo("New Project");
		assertThat(JPA.withTransaction(() -> new ProjectDAO().readById(oldProjectId)).getName()).isEqualToIgnoringCase("My Project");
		assertThat(JPA.withTransaction(() -> new ProjectDAO().readById(newProjectId)).getName()).isEqualToIgnoringCase("New Project");
	}

}
