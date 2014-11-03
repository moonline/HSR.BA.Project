package controllers.task;

import controllers.AbstractControllerTest;
import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import models.task.TaskProperty;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.mvc.Result;
import test.AbstractTestDataCreator;

import java.util.List;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.*;
import static play.test.Helpers.status;

public class TaskPropertyControllerTest extends AbstractControllerTest {

	public static final TaskPropertyDAO TASK_PROPERTY_DAO = new TaskPropertyDAO();
	public static final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO = new TaskPropertyValueDAO();

	@Test
	public void testCreateTaskPropertyWorking() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_PROPERTY_VALUE_DAO::removeAll);
		JPA.withTransaction(TASK_PROPERTY_DAO::removeAll);
		//Test
		Result result = callActionWithUser(routes.ref.TaskPropertyController.create(), postData("name", "My beautiful property"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		//noinspection Convert2MethodRef
		List<TaskProperty> taskProperties = JPA.withTransaction(() -> TASK_PROPERTY_DAO.readAll());
		assertThat(taskProperties).hasSize(1);
		TaskProperty taskProperty = taskProperties.get(0);
		assertThat(taskProperty.getName()).isEqualTo("My beautiful property");
	}

	@Test
	public void testReadAllTaskProperties() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_PROPERTY_DAO::removeAll);
		TaskProperty taskProperty1 = AbstractTestDataCreator.createTaskPropertyWithTransaction("My Task Property X");
		TaskProperty taskProperty2 = AbstractTestDataCreator.createTaskPropertyWithTransaction("My Task Property Y");
		//Test
		Result result = callActionWithUser(routes.ref.TaskPropertyController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("[ { \"id\" : " + taskProperty1.getId() + ",\n" +
				"      \"name\" : \"My Task Property X\"\n" +
				"    },\n" +
				"    { \"id\" : " + taskProperty2.getId() + ",\n" +
				"      \"name\" : \"My Task Property Y\"\n" +
				"    }\n" +
				"  ]"));
	}


	@Test
	public void testReadOneTaskProperty() throws Throwable {
		//Setup
		TaskProperty taskProperty = AbstractTestDataCreator.createTaskPropertyWithTransaction("My Task Property Z");
		//Test
		Result result = callActionWithUser(routes.ref.TaskPropertyController.read(taskProperty.getId()));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + taskProperty.getId() + ",\n" +
				"      \"name\" : \"My Task Property Z\"\n" +
				"    }"));
	}

	@Test
	public void testReadInexistentTaskProperty() throws Throwable {
		//Test
		Result result = callActionWithUser(routes.ref.TaskPropertyController.read(99999));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
	}

	@Test
	public void testUpdateTaskPropertyWorking() throws Throwable {
		//Setup
		TaskProperty taskProperty = AbstractTestDataCreator.createTaskPropertyWithTransaction("My Task Property Q");
		String newName = "My Task Property Kuh";
		//Test
		Result result = callActionWithUser(routes.ref.TaskPropertyController.update(taskProperty.getId()), postData("name", newName));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + taskProperty.getId() + ",\n" +
				"      \"name\" : \"" + newName + "\"\n" +
				"    }"));
		TaskProperty taskPropertyInDB = JPA.withTransaction(() -> TASK_PROPERTY_DAO.readById(taskProperty.getId()));
		assertThat(taskPropertyInDB.getName()).isEqualTo(newName);
	}

	@Test
	public void testDeleteTaskProperty() throws Throwable {
		//Setup
		Long taskProperty = AbstractTestDataCreator.createTaskPropertyWithTransaction("My Task Property A").getId();
		//Test
		Result result = callActionWithUser(routes.ref.TaskPropertyController.delete(taskProperty));
		//Verification
		assertThat(status(result)).isEqualTo(NO_CONTENT);
		assertThat(JPA.withTransaction(() -> TASK_PROPERTY_DAO.readById(taskProperty))).isNull();
	}

	@Test
	public void testCannotDeleteTaskProperty() throws Throwable {
		//Setup
		Long taskProperty = JPA.withTransaction(() -> {
			TaskProperty taskProperty1 = AbstractTestDataCreator.createTaskProperty("My Task Property B");
			AbstractTestDataCreator.createTaskPropertyValue("My value", taskProperty1, AbstractTestDataCreator.createTaskTemplate("My Task"));
			return taskProperty1.getId();
		});
		//Test
		Result result = callActionWithUser(routes.ref.TaskPropertyController.delete(taskProperty));
		//Verification
		assertThat(status(result)).isEqualTo(CONFLICT);
		assertThat(JPA.withTransaction(() -> TASK_PROPERTY_DAO.readById(taskProperty))).isNotNull();
	}

}
