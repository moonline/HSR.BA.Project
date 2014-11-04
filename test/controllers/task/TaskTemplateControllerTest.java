package controllers.task;

import controllers.AbstractControllerTest;
import daos.task.TaskPropertyValueDAO;
import daos.task.TaskTemplateDAO;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;
import models.task.TaskTemplate;
import models.user.User;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.mvc.Result;
import test.AbstractTestDataCreator;

import java.util.List;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.*;
import static play.test.Helpers.status;
import static test.AbstractTestDataCreator.createUserWithTransaction;

public class TaskTemplateControllerTest extends AbstractControllerTest {

	public static final TaskTemplateDAO TASK_TEMPLATE_DAO = new TaskTemplateDAO();
	public static final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO = new TaskPropertyValueDAO();

	@Test
	public void testCreateTaskTemplateWorking() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_PROPERTY_VALUE_DAO::removeAll);
		JPA.withTransaction(TASK_TEMPLATE_DAO::removeAll);
		User user = createUserWithTransaction("User 9p", "123");
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.create(), user, postData("name", "My beautiful task"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		//noinspection Convert2MethodRef
		List<TaskTemplate> taskTemplates = JPA.withTransaction(() -> TASK_TEMPLATE_DAO.readAll());
		assertThat(taskTemplates).hasSize(1);
		TaskTemplate taskTemplate = taskTemplates.get(0);
		assertThat(taskTemplate.getName()).isEqualTo("My beautiful task");
	}

	@Test
	public void testReadAllTaskTemplates() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_PROPERTY_VALUE_DAO::removeAll);
		JPA.withTransaction(TASK_TEMPLATE_DAO::removeAll);
		TaskTemplate taskTemplate1 = AbstractTestDataCreator.createTaskTemplateWithTransaction("My Task Template X");
		TaskTemplate taskTemplate2 = AbstractTestDataCreator.createTaskTemplateWithTransaction("My Task Template Y");
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("[ { \"id\" : " + taskTemplate1.getId() + ",\n" +
				"      \"name\" : \"My Task Template X\",\n" +
				"      \"parent\" : null,\n" +
				"      \"properties\" : [],\n" +
				"      \"dksNode\" : []\n" +
				"    },\n" +
				"    { \"id\" : " + taskTemplate2.getId() + ",\n" +
				"      \"name\" : \"My Task Template Y\",\n" +
				"      \"parent\" : null,\n" +
				"      \"properties\" : [],\n" +
				"      \"dksNode\" : []\n" +
				"    }\n" +
				"  ]"));
	}


	@Test
	public void testReadOneTaskTemplate() throws Throwable {
		//Setup
		TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("My Task Template Z");
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.read(taskTemplate.getId()));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + taskTemplate.getId() + ",\n" +
				"      \"name\" : \"My Task Template Z\",\n" +
				"      \"parent\" : null,\n" +
				"      \"properties\" : [],\n" +
				"      \"dksNode\" : []\n" +
				"    }"));
	}

	@Test
	public void testReadOneTaskTemplateWithProperties() throws Throwable {
		//Setup
		TaskPropertyValue taskPropertyValue = JPA.withTransaction(() -> {
			TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplate("My Task Template Z");
			return AbstractTestDataCreator.createTaskPropertyValue("property value", "property name", taskTemplate);
		});
		Long taskTemplate = taskPropertyValue.getTaskTemplate().getId();
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.read(taskTemplate));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + taskTemplate + ",\n" +
				"      \"name\" : \"My Task Template Z\",\n" +
				"      \"parent\" : null,\n" +
				"      \"properties\" : [" +
				"		{\"id\":" + taskPropertyValue.getId() + "," +
				"			\"property\":{" +
				"				\"id\":" + taskPropertyValue.getProperty().getId() + "," +
				"				\"name\":\"property name\"" +
				"			}," +
				"			\"value\":\"property value\"" +
				"		}],\n" +
				"      \"dksNode\" : []\n" +
				"    }"));
	}

	@Test
	public void testReadInexistentTaskTemplate() throws Throwable {
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.read(99999));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
	}

	@Test
	public void testUpdateTaskTemplateWorking() throws Throwable {
		//Setup
		TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("My Task Template Q");
		String newName = "My Task Template Kuh";
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.update(taskTemplate.getId()), postData("name", newName));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + taskTemplate.getId() + ",\n" +
				"      \"name\" : \"" + newName + "\"," +
				"      \"parent\" : null,\n" +
				"      \"properties\" : [],\n" +
				"      \"dksNode\" : []\n" +
				"    }"));
		TaskTemplate taskTemplateInDB = JPA.withTransaction(() -> TASK_TEMPLATE_DAO.readById(taskTemplate.getId()));
		assertThat(taskTemplateInDB.getName()).isEqualTo(newName);
	}

	@Test
	public void testDeleteTaskTemplate() throws Throwable {
		//Setup
		Long taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("My Task Template A").getId();
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.delete(taskTemplate));
		//Verification
		assertThat(status(result)).isEqualTo(NO_CONTENT);
		assertThat(JPA.withTransaction(() -> TASK_TEMPLATE_DAO.readById(taskTemplate))).isNull();
	}

	@Test
	public void testMakeSubTaskTemplate() throws Throwable {
		//Setup
		TaskTemplate parent = AbstractTestDataCreator.createTaskTemplateWithTransaction("Paaaarent");
		TaskTemplate child = AbstractTestDataCreator.createTaskTemplateWithTransaction("Child");
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.update(child.getId()), postData(
				"name", "Child",
				"parent", parent.getId() + ""));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + child.getId() + ",\n" +
				"      \"name\" : \"Child\",\n" +
				"      \"parent\" : {" +
				"         \"id\" : " + parent.getId() + "," +
				"         \"name\" : \"Paaaarent\"," +
				"         \"parent\" : null," +
				"         \"properties\" : [],\n" +
				"         \"dksNode\" : []" +
				"      }," +
				"      \"properties\" : [],\n" +
				"      \"dksNode\" : []\n" +
				"    }"));
		TaskTemplate childInDB = JPA.withTransaction(() -> TASK_TEMPLATE_DAO.readById(child.getId()));
		assertThat(childInDB.getName()).isEqualTo("Child");
		assertThat(childInDB.getParent().getId()).isEqualTo(parent.getId());
	}

	@Test
	public void testCannotMakeSubSubTaskTemplate() throws Throwable {
		//Setup
		TaskTemplate middle = JPA.withTransaction(() -> {
			TaskTemplate parent = AbstractTestDataCreator.createTaskTemplate("Parent");
			return AbstractTestDataCreator.createTaskTemplate("Middle", parent);
		});
		TaskTemplate child = AbstractTestDataCreator.createTaskTemplateWithTransaction("Child");
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.update(child.getId()), postData(
				"name", "Child",
				"parent", middle.getId() + ""));
		//Verification
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
		TaskTemplate childInDB = JPA.withTransaction(() -> TASK_TEMPLATE_DAO.readById(child.getId()));
		assertThat(childInDB.getParent()).isNull();
	}

	@Test
	public void testAddPropertyWorking() throws Throwable {
		//Setup
		JPA.withTransaction(TASK_PROPERTY_VALUE_DAO::removeAll);
		TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("My Task Template R");
		TaskProperty taskProperty = AbstractTestDataCreator.createTaskPropertyWithTransaction("My Property");
		String value = "My Value";
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.addProperty(taskTemplate.getId()), postData("property", taskProperty.getId() + "", "value", value));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		TaskPropertyValue taskPropertyValue = JPA.withTransaction(() -> TASK_PROPERTY_VALUE_DAO.readAll().get(0));
		assertThat(taskPropertyValue.getValue()).isEqualTo(value);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + taskTemplate.getId() + ",\n" +
				"      \"name\" : \"My Task Template R\"," +
				"      \"parent\" : null,\n" +
				"      \"properties\" : [" +
				"		{\"id\":" + taskPropertyValue.getId() + "," +
				"			\"property\":{" +
				"				\"id\":" + taskProperty.getId() + "," +
				"				\"name\":\"My Property\"" +
				"			}," +
				"			\"value\":\"My Value\"" +
				"		}],\n" +
				"      \"dksNode\" : []\n" +
				"    }"));
	}

	@Test
	public void testUpdatePropertyWorking() throws Throwable {
		//Setup
		TaskPropertyValue taskPropertyValue = JPA.withTransaction(() -> {
			TASK_PROPERTY_VALUE_DAO.removeAll();
			TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplate("Task Template I");
			return AbstractTestDataCreator.createTaskPropertyValue("Task Value II", "Task Property III", taskTemplate);
		});
		String newValue = "Task Value IV";
		//Test
		Result result = callActionWithUser(routes.ref.TaskTemplateController.updateProperty(taskPropertyValue.getId(), taskPropertyValue.getTaskTemplate().getId()), postData("property", taskPropertyValue.getProperty().getId() + "", "value", newValue));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		TaskPropertyValue taskPropertyValueInDB = JPA.withTransaction(() -> TASK_PROPERTY_VALUE_DAO.readById(taskPropertyValue.getId()));
		assertThat(taskPropertyValueInDB.getValue()).isEqualTo(newValue);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + taskPropertyValue.getTaskTemplate().getId() + ",\n" +
				"      \"name\" : \"Task Template I\"," +
				"      \"parent\" : null,\n" +
				"      \"properties\" : [" +
				"		{\"id\":" + taskPropertyValue.getId() + "," +
				"			\"property\":{" +
				"				\"id\":" + taskPropertyValue.getProperty().getId() + "," +
				"				\"name\":\"Task Property III\"" +
				"			}," +
				"			\"value\":\"Task Value IV\"" +
				"		}],\n" +
				"      \"dksNode\" : []\n" +
				"    }"));
	}

}
