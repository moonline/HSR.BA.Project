package controllers.task;

import controllers.GuaranteeAuthenticatedUser;
import daos.task.TaskTemplateDAO;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import logics.task.TaskTemplateLogic;
import models.task.TaskTemplate;
import play.data.Form;
import play.db.jpa.Transactional;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryResponses.Response;

public class TaskTemplateController extends Controller {

	public static final TaskTemplateLogic TASK_TEMPLATE_LOGIC = new TaskTemplateLogic();
	public static final TaskTemplateDAO TASK_TEMPLATE_DAO = new TaskTemplateDAO();

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@QueryParameters.Parameter(name = "name", description = "The name of the new Task Template")
	})
	@QueryDescription("Creates a new Task Template of which (concrete) Tasks then can be generated.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@Response(status = OK, description = "The new created Task Template is returned")
	})
	@QueryExamples({
			@Example(parameters = {})
	})
	public static Result create() {
		Form<TaskTemplateLogic.CreateTaskTemplateForm> form = Form.form(TaskTemplateLogic.CreateTaskTemplateForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(Json.toJson(TASK_TEMPLATE_LOGIC.create(form.get())));
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Template to get")})
	@QueryDescription("Reads a Task Template.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Template with the given ID exists"),
			@Response(status = OK, description = "If it's found, it's returned")
	})
	@QueryExamples({
			@Example(parameters = {"9999"}),
			@Example(parameters = {"REFERENCE_TASKTEMPLATE_8"})
	})
	public static Result read(Long id) {
		TaskTemplate taskTemplate = TASK_TEMPLATE_DAO.readById(id);
		if (taskTemplate == null) {
			return notFound();
		}
		return ok(Json.toJson(taskTemplate));
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads all Task Templates.")
	@QueryResponses({
			@Response(status = OK, description = "If it's found, it's returned")
	})
	@QueryExamples({
			@Example(parameters = {})
	})
	public static Result readAll() {
		return ok(Json.toJson(TASK_TEMPLATE_DAO.readAll()));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Template to update"),
			@QueryParameters.Parameter(name = "name", description = "The new name of the Task Template")
	})
	@QueryDescription("Updates an existing Task Template with new data.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Template with the given ID exists"),
			@Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@Response(status = OK, description = "The new created Task Template is returned")
	})
	@QueryExamples({
			@Example(parameters = {"9999"}),
			@Example(parameters = {"REFERENCE_TASKTEMPLATE_8"})
	})
	public static Result update(Long id) {
		TaskTemplate taskTemplate = TASK_TEMPLATE_DAO.readById(id);
		if (taskTemplate == null) {
			return notFound();
		}
		Form<TaskTemplateLogic.CreateTaskTemplateForm> form = Form.form(TaskTemplateLogic.CreateTaskTemplateForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(Json.toJson(TASK_TEMPLATE_LOGIC.update(taskTemplate, form.get())));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Template to delete")})
	@QueryDescription("Deletes a Task Template.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Template with the given ID exists"),
			@Response(status = CONFLICT, description = "If the Task Template could not be deleted, because something else depends on it"),
			@Response(status = NO_CONTENT, description = "If the Task Template is successfully deleted")
	})
	@QueryExamples({
			@Example(parameters = {"9999"}),
			@Example(parameters = {"REFERENCE_TASKTEMPLATE_13"}, isDataCacheable = false)
	})
	public static Result delete(Long id) {
		TaskTemplate taskTemplate = TASK_TEMPLATE_DAO.readById(id);
		if (taskTemplate == null) {
			return notFound();
		}
		if (TASK_TEMPLATE_LOGIC.delete(taskTemplate)) {
			return noContent();
		} else {
			return status(CONFLICT, "Could not delete the task template, because something else depends on it.");
		}
	}

}
