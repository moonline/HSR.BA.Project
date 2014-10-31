package logics.task;

import daos.task.TaskTemplateDAO;
import models.task.TaskTemplate;
import play.data.validation.Constraints;

public class TaskTemplateLogic {

	public static final TaskTemplateDAO TASK_TEMPLATE_DAO = new TaskTemplateDAO();

	public TaskTemplate create(CreateTaskTemplateForm form) {
		TaskTemplate taskTemplate = new TaskTemplate();
		return update(taskTemplate, form);
	}

	public TaskTemplate update(TaskTemplate taskTemplate, CreateTaskTemplateForm form) {
		taskTemplate.setName(form.name);
		return TASK_TEMPLATE_DAO.persist(taskTemplate);
	}

	public boolean delete(TaskTemplate taskTemplate) {
		if (canBeDeleted(taskTemplate)) {
			TASK_TEMPLATE_DAO.remove(taskTemplate);
			return true;
		}
		return false;
	}

	private boolean canBeDeleted(TaskTemplate taskTemplate) {
		return TASK_TEMPLATE_DAO.readChildren(taskTemplate).isEmpty();
	}

	public static class CreateTaskTemplateForm {
		@Constraints.Required
		public String name;
	}
}
