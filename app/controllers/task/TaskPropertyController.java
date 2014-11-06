package controllers.task;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.AbstractDAO;
import daos.task.TaskPropertyDAO;
import logics.CRUDLogicInterface;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import logics.task.TaskPropertyLogic;
import models.AbstractEntity;
import models.task.TaskProperty;
import play.data.Form;
import play.db.jpa.Transactional;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryResponses.Response;

public class TaskPropertyController extends AbstractCRUDController {

	private final TaskPropertyLogic TASK_PROPERTY_LOGIC;
	private final TaskPropertyDAO TASK_PROPERTY_DAO;

	public TaskPropertyController(TaskPropertyLogic taskPropertyLogic, TaskPropertyDAO taskPropertyDao) {
		TASK_PROPERTY_LOGIC = taskPropertyLogic;
		TASK_PROPERTY_DAO = taskPropertyDao;
	}

	@Override
	protected String getEntityName() {
		return "Task Property";
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@QueryParameters.Parameter(name = "name", description = "The name of the new Task Property")
	})
	@QueryDescription("Creates a new Task Property.")
	@QueryExamples({
			@Example(parameters = {"A new Task Property"})
	})
	public Result create() {
		return create(TASK_PROPERTY_LOGIC, TaskPropertyLogic.TaskPropertyForm.class);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads a Task Property.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_TASKPROPERTY_13", parameters = {})
	})
	public Result read(long id) {
		return read(TASK_PROPERTY_DAO, id);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads all Task Properties.")
	public Result readAll() {
		return readAll(TASK_PROPERTY_DAO);
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Property to update"),
			@QueryParameters.Parameter(name = "name", description = "The new name of the Task Property")
	})
	@QueryDescription("Updates an existing Task Property with new data.")
	@QueryExamples({
			@Example(id = "9999", parameters = {"My beautiful task property"}),
			@Example(id = "REFERENCE_TASKPROPERTY_8", parameters = {"My example Task Property"})
	})
	public Result update(long id) {
		return update(TASK_PROPERTY_DAO, TASK_PROPERTY_LOGIC, TaskPropertyLogic.TaskPropertyForm.class, id);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Property to delete")})
	@QueryDescription("Deletes a Task Property.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Property with the given ID exists"),
			@Response(status = CONFLICT, description = "If the Task Property could not be deleted, because something else depends on it"),
			@Response(status = NO_CONTENT, description = "If the Task Property is successfully deleted")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_TASKPROPERTY_23", parameters = {}, isDataCacheable = false)
	})
	public Result delete(long id) {
		TaskProperty taskProperty = TASK_PROPERTY_DAO.readById(id);
		if (taskProperty == null) {
			return notFound("Could not find Task Property with id " + id);
		}
		if (TASK_PROPERTY_LOGIC.delete(taskProperty)) {
			return noContent();
		} else {
			return status(CONFLICT, "Could not delete the task property, because something else depends on it.");
		}
	}

}
