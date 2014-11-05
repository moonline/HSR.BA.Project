package controllers.task;

import controllers.AbstractController;
import controllers.GuaranteeAuthenticatedUser;
import daos.task.TaskPropertyDAO;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import logics.task.TaskPropertyLogic;
import models.task.TaskProperty;
import play.data.Form;
import play.db.jpa.Transactional;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryResponses.Response;

public class TaskPropertyController extends AbstractController {

	private final TaskPropertyLogic TASK_PROPERTY_LOGIC;
	private final TaskPropertyDAO TASK_PROPERTY_DAO;

	public TaskPropertyController(TaskPropertyLogic taskPropertyLogic, TaskPropertyDAO taskPropertyDao) {
		TASK_PROPERTY_LOGIC = taskPropertyLogic;
		TASK_PROPERTY_DAO = taskPropertyDao;
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@QueryParameters.Parameter(name = "name", description = "The name of the new Task Property")
	})
	@QueryDescription("Creates a new Task Property.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@Response(status = OK, description = "The new created Task Property is returned")
	})
	@QueryExamples({
			@Example(parameters = {"A new Task Property"})
	})
	public Result create() {
		Form<TaskPropertyLogic.TaskPropertyForm> form = Form.form(TaskPropertyLogic.TaskPropertyForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(TASK_PROPERTY_LOGIC.create(form.get())));
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Property to get")})
	@QueryDescription("Reads a Task Property.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Property with the given ID exists"),
			@Response(status = OK, description = "If it's found, it's returned")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_TASKPROPERTY_13", parameters = {})
	})
	public Result read(long id) {
		TaskProperty taskProperty = TASK_PROPERTY_DAO.readById(id);
		if (taskProperty == null) {
			return notFound("Could not find Task Property with id " + id);
		}
		return ok(jsonify(taskProperty));
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads all Task Properties.")
	@QueryResponses({
			@Response(status = OK, description = "If it's found, it's returned")
	})
	@QueryExamples({
			@Example(parameters = {})
	})
	public Result readAll() {
		return ok(jsonify(TASK_PROPERTY_DAO.readAll()));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Property to update"),
			@QueryParameters.Parameter(name = "name", description = "The new name of the Task Property")
	})
	@QueryDescription("Updates an existing Task Property with new data.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Property with the given ID exists"),
			@Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@Response(status = OK, description = "The new created Task Property is returned")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {"My beautiful task property"}),
			@Example(id = "REFERENCE_TASKPROPERTY_8", parameters = {"My example Task Property"})
	})
	public Result update(long id) {
		TaskProperty taskProperty = TASK_PROPERTY_DAO.readById(id);
		if (taskProperty == null) {
			return notFound();
		}
		Form<TaskPropertyLogic.TaskPropertyForm> form = Form.form(TaskPropertyLogic.TaskPropertyForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(TASK_PROPERTY_LOGIC.update(taskProperty, form.get())));
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
