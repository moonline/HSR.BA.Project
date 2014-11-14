package controllers.ppt;

import controllers.AbstractControllerTest;
import daos.ppt.ProcessorDAO;
import models.ppt.Processor;
import models.user.Project;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.mvc.Result;
import test.AbstractTestDataCreator;


import java.util.List;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.NOT_FOUND;
import static play.mvc.Http.Status.NO_CONTENT;
import static play.mvc.Http.Status.OK;
import static play.test.Helpers.status;


public class ProcessorControllerTest extends AbstractControllerTest {
	public static final ProcessorDAO PROCESSOR_DAO = new ProcessorDAO();

	@Test
	public void testCreateProcessorWorking() throws Throwable {
		//Setup
		JPA.withTransaction(PROCESSOR_DAO::removeAll);
		Project project = AbstractTestDataCreator.createProjectWithTransaction();
		//Test
		Result result = callActionWithUser(routes.ref.ProcessorController.create(), postData("name", "Example processor" + "", "project", project.getId() + "", "code", "function(b) { return b; }"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		//noinspection Convert2MethodRef
		List<Processor> processors = JPA.withTransaction(() -> PROCESSOR_DAO.readAll());
		assertThat(processors).hasSize(1);
		Processor mapping = processors.get(0);
		assertThat(mapping.getName()).isEqualTo("Example processor");
		assertThat(mapping.getProject().getId()).isEqualTo(project.getId());
		assertThat(mapping.getCode()).isEqualTo("function(b) { return b; }");
	}

	@Test
	public void testReadAllProcessors() throws Throwable {
		//Setup
		Processor[] processors = JPA.withTransaction(() -> {
			PROCESSOR_DAO.removeAll();
			Processor processor1 = AbstractTestDataCreator.createProcessor("Example processor 2", "My Project", "function() { return 'f'; }");
			return new Processor[]{
					processor1,
					AbstractTestDataCreator.createProcessor("Example processor 3", processor1.getProject(), processor1.getCode())
			};
		});
		//Test
		Result result = callActionWithUser(routes.ref.ProcessorController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\"items\":[" +
				"	{" +
				"		\"id\" : " + processors[0].getId() + ",\n" +
				"		\"name\":\"Example processor 2\",\n" +
				"		\"project\":{\"id\":" + processors[0].getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"		\"code\":\"function() { return 'f'; }\"\n" +
				"    },{" +
				"		\"id\" : " + processors[1].getId() + ",\n" +
				"		\"name\":\"Example processor 3\",\n" +
				"		\"project\":{\"id\":" + processors[0].getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"		\"code\":\"function() { return 'f'; }\"\n" +
				"	}\n" +
				"]}"));
	}

	@Test
	public void testReadOneProcessor() throws Throwable {
		//Setup
		Processor processor = JPA.withTransaction(() -> AbstractTestDataCreator.createProcessor("Example processor 2", "My Project", "function() { return 'f'; }"));

		//Test
		Result result = callActionWithUser(routes.ref.ProcessorController.read(processor.getId()));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\n" +
				"	\"id\" : " + processor.getId() + ",\n" +
				"	\"name\":\"Example processor 2\",\n" +
				"	\"project\":{\"id\":" + processor.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"code\":\"function() { return 'f'; }\"\n" +
				"}"));
	}

	@Test
	public void testReadInexistentProcessor() throws Throwable {
		//Test
		Result result = callActionWithUser(routes.ref.ProcessorController.read(99999));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
	}

	@Test
	public void testUpdateProcessorWorking() throws Throwable {
		//Setup
		Processor processor = JPA.withTransaction(() -> AbstractTestDataCreator.createProcessor("Example processor 2", "My Project", "function() { return 'f'; }"));

		String name = "Example processor 5";
		Long project = processor.getProject().getId();
		String code = "function() { return 'f'; }";
		//Test
		Result result = callActionWithUser(routes.ref.ProcessorController.update(processor.getId()), postData("name", name, "project", processor.getProject().getId() + "", "code", code));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ " +
				"	\"id\" : " + processor.getId() + ",\n" +
				"	\"name\" : \"" + name + "\",\n" +
				"	\"project\":{\"id\":" + processor.getProject().getId() + ",\"name\":\"My Project\"},\n" +
				"	\"code\" : \"" + code + "\"\n" +
				"}"));
		Processor processorInDB = JPA.withTransaction(() -> PROCESSOR_DAO.readById(processor.getId()));
		assertThat(processorInDB.getProject().getId()).isEqualTo(project);
		assertThat(processorInDB.getName()).isEqualTo(name);
		assertThat(processorInDB.getCode()).isEqualTo(code);
	}

	@Test
	public void testDeleteProcessor() throws Throwable {
		//Setup
		Long processor = JPA.withTransaction(() -> AbstractTestDataCreator.createProcessor("Example processor 2", "My Project", "function() { return 'f'; }")).getId();
		//Test
		Result result = callActionWithUser(routes.ref.ProcessorController.delete(processor));
		//Verification
		assertThat(status(result)).isEqualTo(NO_CONTENT);
		assertThat(JPA.withTransaction(() -> PROCESSOR_DAO.readById(processor))).isNull();
	}
}
