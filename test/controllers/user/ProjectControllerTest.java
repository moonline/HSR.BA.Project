package controllers.user;

import controllers.AbstractControllerTest;
import daos.user.ProjectDAO;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.mvc.Result;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.status;

public class ProjectControllerTest extends AbstractControllerTest {

	@Test
	public void testReadTheSingleProject() throws Throwable {
		Result result = callActionWithUser(routes.ref.ProjectController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		Long projectId = JPA.withTransaction(() -> new ProjectDAO().readAll().get(0).getId());
		assertCheckJsonResponse(result, Json.parse("{\"items\":[{" +
				"	\"id\" : " + projectId + ",\n" +
				"	\"name\":\"Project\"\n" +
				"}]}"));
	}

}
