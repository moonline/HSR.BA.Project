package controllers.ppt;

import controllers.AbstractControllerTest;
import daos.ppt.RequestTemplateDAO;
import models.ppt.RequestTemplate;
import models.ppt.ProjectPlanningTool;
import models.user.Project;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.mvc.Result;
import test.AbstractTestDataCreator;

import java.util.List;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.*;
import static play.test.Helpers.status;

public class RequestTemplateControllerTest extends AbstractControllerTest {
	public static final RequestTemplateDAO REQUEST_TEMPLATE_DAO = new RequestTemplateDAO();

	@Test
	public void testCreateRequestTemplateWorking() throws Throwable {
		//Setup
		JPA.withTransaction(REQUEST_TEMPLATE_DAO::removeAll);
		ProjectPlanningTool ppt = AbstractTestDataCreator.createProjectPlanningToolWithTransaction("My PPT");
		Project project = AbstractTestDataCreator.createProjectWithTransaction("My Project");
		//Test
		Result result = callActionWithUser(routes.ref.RequestTemplateController.create(), postData("name", "My Request Template", "ppt", ppt.getId() + "", "project", project.getId() + "", "url", "/post/target", "requestBodyTemplate", "{\"name\":\"${title}\"}"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		//noinspection Convert2MethodRef
		List<RequestTemplate> requestTemplates = JPA.withTransaction(() -> REQUEST_TEMPLATE_DAO.readAll());
		assertThat(requestTemplates).hasSize(1);
		RequestTemplate requestTemplate = requestTemplates.get(0);
		assertThat(requestTemplate.getPpt().getId()).isEqualTo(ppt.getId());
		assertThat(requestTemplate.getProject().getId()).isEqualTo(project.getId());
		assertThat(requestTemplate.getUrl()).isEqualTo("/post/target");
		assertThat(requestTemplate.getRequestBodyTemplate()).isEqualTo("{\"name\":\"${title}\"}");
		assertCheckJsonResponse(result, Json.parse("{\n" +
				"	\"id\":" + requestTemplate.getId() + ",\n" +
				"	\"name\":\"My Request Template\",\n" +
				"	\"ppt\":{\"id\":" + requestTemplate.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + requestTemplate.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"url\":\"/post/target\",\n" +
				"	\"requestBodyTemplate\":\"{\\\"name\\\":\\\"${title}\\\"}\"\n" +
				"}"));
	}

	@Test
	public void testReadAllRequestTemplates() throws Throwable {
		//Setup
		RequestTemplate[] requestTemplates = JPA.withTransaction(() -> {
			REQUEST_TEMPLATE_DAO.removeAll();
			RequestTemplate requestTemplate1 = AbstractTestDataCreator.createRequestTemplate("My Request Template 1", "My PPT", "My Project", "/example/target", "{}");
			return new RequestTemplate[]{
					requestTemplate1,
					AbstractTestDataCreator.createRequestTemplate("My Request Template 2", requestTemplate1.getPpt(), requestTemplate1.getProject(), "/another/example/target", "{\"name\":\"${title}\"}")
			};
		});
		//Test
		Result result = callActionWithUser(routes.ref.RequestTemplateController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\"items\":[" +
				"	{" +
				"		\"id\" : " + requestTemplates[0].getId() + ",\n" +
				"		\"name\":\"My Request Template 1\",\n" +
				"		\"ppt\":{\"id\":" + requestTemplates[0].getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"		\"project\":{\"id\":" + requestTemplates[0].getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"		\"url\":\"/example/target\",\n" +
				"		\"requestBodyTemplate\":\"{}\"\n" +
				"    },{" +
				"		\"id\" : " + requestTemplates[1].getId() + ",\n" +
				"		\"name\":\"My Request Template 2\",\n" +
				"		\"ppt\":{\"id\":" + requestTemplates[0].getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"		\"project\":{\"id\":" + requestTemplates[0].getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"		\"url\":\"/another/example/target\",\n" +
				"		\"requestBodyTemplate\":\"{\\\"name\\\":\\\"${title}\\\"}\"\n" +
				"	}\n" +
				"]}"));
	}


	@Test
	public void testReadOneRequestTemplate() throws Throwable {
		//Setup
		RequestTemplate requestTemplate = AbstractTestDataCreator.createRequestTemplateWithTransaction("My Request Template", "My PPT", "My Project", "/example/target", "{}");
		//Test
		Result result = callActionWithUser(routes.ref.RequestTemplateController.read(requestTemplate.getId()));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\n" +
				"	\"id\" : " + requestTemplate.getId() + ",\n" +
				"	\"name\":\"My Request Template\",\n" +
				"	\"ppt\":{\"id\":" + requestTemplate.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + requestTemplate.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"url\":\"/example/target\",\n" +
				"	\"requestBodyTemplate\":\"{}\"\n" +
				"}"));
	}

	@Test
	public void testReadInexistentRequestTemplate() throws Throwable {
		//Test
		Result result = callActionWithUser(routes.ref.RequestTemplateController.read(99999));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
	}

	@Test
	public void testUpdateRequestTemplateWorking() throws Throwable {
		//Setup
		RequestTemplate requestTemplate = AbstractTestDataCreator.createRequestTemplateWithTransaction("My Request Template", "My PPT", "My Project", "/example/target", "{}");
		Long ppt = requestTemplate.getPpt().getId();
		Long project = requestTemplate.getProject().getId();
		String url = "/post/target2";
		String requestBodyTemplate = "{\"name\":\"${titleeee}\"}";
		//Test
		Result result = callActionWithUser(routes.ref.RequestTemplateController.update(requestTemplate.getId()), postData("name", "My Request Template", "ppt", requestTemplate.getPpt().getId() + "", "project", requestTemplate.getProject().getId() + "", "url", url, "requestBodyTemplate", requestBodyTemplate));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + requestTemplate.getId() + ",\n" +
				"	\"name\":\"My Request Template\",\n" +
				"	\"ppt\":{\"id\":" + requestTemplate.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + requestTemplate.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"url\" : \"" + url + "\",\n" +
				"	\"requestBodyTemplate\" : \"{\\\"name\\\":\\\"${titleeee}\\\"}\"\n" +
				"}"));
		RequestTemplate requestTemplateInDB = JPA.withTransaction(() -> REQUEST_TEMPLATE_DAO.readById(requestTemplate.getId()));
		assertThat(requestTemplateInDB.getPpt().getId()).isEqualTo(ppt);
		assertThat(requestTemplateInDB.getProject().getId()).isEqualTo(project);
		assertThat(requestTemplateInDB.getUrl()).isEqualTo(url);
		assertThat(requestTemplateInDB.getRequestBodyTemplate()).isEqualTo(requestBodyTemplate);
	}

	@Test
	public void testDeleteRequestTemplate() throws Throwable {
		//Setup
		Long requestTemplate = AbstractTestDataCreator.createRequestTemplateWithTransaction("My Request Template", "My PPT", "My Project", "/example/target9", "{}").getId();
		//Test
		Result result = callActionWithUser(routes.ref.RequestTemplateController.delete(requestTemplate));
		//Verification
		assertThat(status(result)).isEqualTo(NO_CONTENT);
		assertThat(JPA.withTransaction(() -> REQUEST_TEMPLATE_DAO.readById(requestTemplate))).isNull();
	}
}
