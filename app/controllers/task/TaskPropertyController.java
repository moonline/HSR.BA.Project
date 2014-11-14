package controllers.task;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.task.TaskPropertyDAO;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.task.TaskPropertyLogic;
import models.task.TaskProperty;
import play.db.jpa.Transactional;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;

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
		return create(TASK_PROPERTY_LOGIC, TaskProperty.class);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads a Task Property.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_TASKPROPERTY_1000000000000000013", parameters = {})
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
			@Example(id = "REFERENCE_TASKPROPERTY_1000000000000000008", parameters = {"My example Task Property"})
	})
	public Result update(long id) {
		return update(TASK_PROPERTY_DAO, TASK_PROPERTY_LOGIC, TaskProperty.class, id);
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Deletes a Task Property.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_TASKPROPERTY_1000000000000000023", parameters = {}, isDataCacheable = false)
	})
	public Result delete(long id) {
		return delete(TASK_PROPERTY_DAO, TASK_PROPERTY_LOGIC, id);
	}

}
