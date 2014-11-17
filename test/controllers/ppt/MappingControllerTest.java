package controllers.ppt;

import controllers.AbstractControllerTest;
import daos.ppt.MappingDAO;
import models.ppt.Mapping;
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

public class MappingControllerTest extends AbstractControllerTest {
	public static final MappingDAO MAPPING_DAO = new MappingDAO();

	@Test
	public void testCreateMappingWorking() throws Throwable {
		//Setup
		JPA.withTransaction(MAPPING_DAO::removeAll);
		ProjectPlanningTool ppt = AbstractTestDataCreator.createProjectPlanningToolWithTransaction("My PPT");
		Project project = AbstractTestDataCreator.createProjectWithTransaction("My Project");
		//Test
		Result result = callActionWithUser(routes.ref.MappingController.create(), postData("ppt", ppt.getId() + "", "project", project.getId() + "", "url", "/post/target", "requestTemplate", "{\"name\":\"${title}\"}"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		//noinspection Convert2MethodRef
		List<Mapping> mappings = JPA.withTransaction(() -> MAPPING_DAO.readAll());
		assertThat(mappings).hasSize(1);
		Mapping mapping = mappings.get(0);
		assertThat(mapping.getPpt().getId()).isEqualTo(ppt.getId());
		assertThat(mapping.getProject().getId()).isEqualTo(project.getId());
		assertThat(mapping.getUrl()).isEqualTo("/post/target");
		assertThat(mapping.getRequestTemplate()).isEqualTo("{\"name\":\"${title}\"}");
		assertCheckJsonResponse(result, Json.parse("{\n" +
				"	\"id\":" + mapping.getId() + ",\n" +
				"	\"ppt\":{\"id\":" + mapping.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + mapping.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"url\":\"/post/target\",\n" +
				"	\"requestTemplate\":\"{\\\"name\\\":\\\"${title}\\\"}\"\n" +
				"}"));
	}

	@Test
	public void testReadAllMappings() throws Throwable {
		//Setup
		Mapping[] mappings = JPA.withTransaction(() -> {
			MAPPING_DAO.removeAll();
			Mapping mapping1 = AbstractTestDataCreator.createMapping("My PPT", "My Project", "/example/target", "{}");
			return new Mapping[]{
					mapping1,
					AbstractTestDataCreator.createMapping(mapping1.getPpt(), mapping1.getProject(), "/another/example/target", "{\"name\":\"${title}\"}")
			};
		});
		//Test
		Result result = callActionWithUser(routes.ref.MappingController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\"items\":[" +
				"	{" +
				"		\"id\" : " + mappings[0].getId() + ",\n" +
				"		\"ppt\":{\"id\":" + mappings[0].getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"		\"project\":{\"id\":" + mappings[0].getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"		\"url\":\"/example/target\",\n" +
				"		\"requestTemplate\":\"{}\"\n" +
				"    },{" +
				"		\"id\" : " + mappings[1].getId() + ",\n" +
				"		\"ppt\":{\"id\":" + mappings[0].getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"		\"project\":{\"id\":" + mappings[0].getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"		\"url\":\"/another/example/target\",\n" +
				"		\"requestTemplate\":\"{\\\"name\\\":\\\"${title}\\\"}\"\n" +
				"	}\n" +
				"]}"));
	}


	@Test
	public void testReadOneMapping() throws Throwable {
		//Setup
		Mapping mapping = AbstractTestDataCreator.createMappingWithTransaction("My PPT", "My Project", "/example/target", "{}");
		//Test
		Result result = callActionWithUser(routes.ref.MappingController.read(mapping.getId()));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\n" +
				"	\"id\" : " + mapping.getId() + ",\n" +
				"	\"ppt\":{\"id\":" + mapping.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + mapping.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"url\":\"/example/target\",\n" +
				"	\"requestTemplate\":\"{}\"\n" +
				"}"));
	}

	@Test
	public void testReadInexistentMapping() throws Throwable {
		//Test
		Result result = callActionWithUser(routes.ref.MappingController.read(99999));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
	}

	@Test
	public void testUpdateMappingWorking() throws Throwable {
		//Setup
		Mapping mapping = AbstractTestDataCreator.createMappingWithTransaction("My PPT", "My Project", "/example/target", "{}");
		Long ppt = mapping.getPpt().getId();
		Long project = mapping.getProject().getId();
		String url = "/post/target2";
		String requestTemplate = "{\"name\":\"${titleeee}\"}";
		//Test
		Result result = callActionWithUser(routes.ref.MappingController.update(mapping.getId()), postData("ppt", mapping.getPpt().getId() + "", "project", mapping.getProject().getId() + "", "url", url, "requestTemplate", requestTemplate));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + mapping.getId() + ",\n" +
				"	\"ppt\":{\"id\":" + mapping.getPpt().getId() + ",\"name\":\"My PPT\"},\n" +
				"	\"project\":{\"id\":" + mapping.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"url\" : \"" + url + "\",\n" +
				"	\"requestTemplate\" : \"{\\\"name\\\":\\\"${titleeee}\\\"}\"\n" +
				"}"));
		Mapping mappingInDB = JPA.withTransaction(() -> MAPPING_DAO.readById(mapping.getId()));
		assertThat(mappingInDB.getPpt().getId()).isEqualTo(ppt);
		assertThat(mappingInDB.getProject().getId()).isEqualTo(project);
		assertThat(mappingInDB.getUrl()).isEqualTo(url);
		assertThat(mappingInDB.getRequestTemplate()).isEqualTo(requestTemplate);
	}

	@Test
	public void testDeleteMapping() throws Throwable {
		//Setup
		Long mapping = AbstractTestDataCreator.createMappingWithTransaction("My PPT", "My Project", "/example/target9", "{}").getId();
		//Test
		Result result = callActionWithUser(routes.ref.MappingController.delete(mapping));
		//Verification
		assertThat(status(result)).isEqualTo(NO_CONTENT);
		assertThat(JPA.withTransaction(() -> MAPPING_DAO.readById(mapping))).isNull();
	}
}
