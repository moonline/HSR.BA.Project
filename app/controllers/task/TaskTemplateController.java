package controllers.task;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.task.TaskPropertyValueDAO;
import daos.task.TaskTemplateDAO;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import logics.task.TaskTemplateLogic;
import models.task.TaskPropertyValue;
import models.task.TaskTemplate;
import play.data.Form;
import play.db.jpa.Transactional;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryResponses.Response;

public class TaskTemplateController extends AbstractCRUDController {

	private final TaskTemplateLogic TASK_TEMPLATE_LOGIC;
	private final TaskTemplateDAO TASK_TEMPLATE_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public TaskTemplateController(TaskTemplateLogic taskTemplateLogic, TaskTemplateDAO taskTemplateDao, TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_TEMPLATE_LOGIC = taskTemplateLogic;
		TASK_TEMPLATE_DAO = taskTemplateDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
	}

	@Override
	protected String getEntityName() {
		return "Task Template";
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@QueryParameters.Parameter(name = "name", description = "The name of the new Task Template")
	})
	@QueryDescription("Creates a new Task Template of which (concrete) Tasks then can be generated.")
	@QueryExamples({
			@Example(parameters = {"A new Task Template"})
	})
	public Result create() {
		return create(TASK_TEMPLATE_LOGIC, TaskTemplateLogic.TaskTemplateForm.class);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads a Task Template.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_TASKTEMPLATE_8", parameters = {})
	})
	public Result read(long id) {
		return read(TASK_TEMPLATE_DAO, id);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads all Task Templates.")
	public Result readAll() {
		return readAll(TASK_TEMPLATE_DAO);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Template to update"),
			@QueryParameters.Parameter(name = "name", description = "The new name of the Task Template")
	})
	@QueryDescription("Updates an existing Task Template with new data.")
	@QueryExamples({
			@Example(id = "9999", parameters = {"My beautiful task template"}),
			@Example(id = "REFERENCE_TASKTEMPLATE_8", parameters = {"My example Task Template"})
	})
	public Result update(long id) {
		return update(TASK_TEMPLATE_DAO, TASK_TEMPLATE_LOGIC, TaskTemplateLogic.TaskTemplateForm.class, id);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Deletes a Task Template.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_TASKTEMPLATE_13", parameters = {}, isDataCacheable = false)
	})
	public Result delete(long id) {
		return delete(TASK_TEMPLATE_DAO, TASK_TEMPLATE_LOGIC, id);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Template"),
			@QueryParameters.Parameter(name = "property", description = "The id of the Task Property"),
			@QueryParameters.Parameter(name = "value", description = "The value of the Property")
	})
	@QueryDescription("Adds a new property to an existing Task Template.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Template with the given ID exists"),
			@Response(status = BAD_REQUEST, description = "If the request parameters contain errors."),
			@Response(status = OK, description = "The Task Template containing the new Property is returned")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {"8888", "My beautiful task value"}),
			@Example(id = "REFERENCE_TASKTEMPLATE_25", parameters = {"REFERENCE_TASKPROPERTY_27", "My example Task Value"})
	})
	public Result addProperty(long id) {
		TaskTemplate taskTemplate = TASK_TEMPLATE_DAO.readById(id);
		if (taskTemplate == null) {
			return notFound(id);
		}
		Form<TaskTemplateLogic.TaskPropertyForm> form = Form.form(TaskTemplateLogic.TaskPropertyForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(TASK_TEMPLATE_LOGIC.addProperty(taskTemplate, form.get())));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Template Value"),
			@QueryParameters.Parameter(name = "taskTemplate", isId = true, format = Long.class, description = "The id of the Task Template"),
			@QueryParameters.Parameter(name = "property", description = "The id of the Task Property"),
			@QueryParameters.Parameter(name = "value", description = "The value of the Property")
	})
	@QueryDescription("Updates a task property value.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Template or Task Property Value with the given ID exists"),
			@Response(status = BAD_REQUEST, description = "If the request parameters contain errors."),
			@Response(status = OK, description = "The Task Template containing the updated Property is returned")
	})
	@QueryExamples({
			@Example(id = {"9999", "7777"}, parameters = {"8888", "My beautiful task template"}),
			@Example(id = {"REFERENCE_TASKPROPERTYVALUE_29", "REFERENCE_TASKTEMPLATE_25"}, parameters = {"REFERENCE_TASKPROPERTY_27", "My example Value"})
	})
	public Result updateProperty(long id, long taskTemplate) {
		TaskPropertyValue taskPropertyValue = TASK_PROPERTY_VALUE_DAO.readById(id);
		if (taskPropertyValue == null || taskPropertyValue.getTaskTemplate().getId() != taskTemplate) {
			return notFound(id);
		}
		Form<TaskTemplateLogic.TaskPropertyForm> form = Form.form(TaskTemplateLogic.TaskPropertyForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(TASK_TEMPLATE_LOGIC.updateProperty(taskPropertyValue, form.get())));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Task Template Value"),
			@QueryParameters.Parameter(name = "taskTemplate", isId = true, format = Long.class, description = "The id of the Task Template")
	})
	@QueryDescription("Deletes a task property value.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If no Task Template or Task Property Value with the given ID exists"),
			@Response(status = OK, description = "The Task Template containing the removed Property is returned")
	})
	@QueryExamples({
			@Example(id = {"9999", "7777"}, parameters = {}),
			@Example(id = {"REFERENCE_TASKPROPERTYVALUE_30", "REFERENCE_TASKTEMPLATE_31"}, isDataCacheable = false, parameters = {})
	})
	public Result deleteProperty(long id, long taskTemplate) {
		TaskPropertyValue taskPropertyValue = TASK_PROPERTY_VALUE_DAO.readById(id);
		if (taskPropertyValue == null || taskPropertyValue.getTaskTemplate().getId() != taskTemplate) {
			return notFound(id);
		}
		return ok(jsonify(TASK_TEMPLATE_LOGIC.removeProperty(taskPropertyValue)));
	}

}
