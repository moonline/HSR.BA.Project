package logics.task;

import daos.task.TaskTemplateDAO;
import models.task.TaskTemplate;
import play.data.validation.Constraints;

public class TaskTemplateLogic {

	private final TaskTemplateDAO TASK_TEMPLATE_DAO;

	public TaskTemplateLogic(TaskTemplateDAO taskTemplateDao) {
		TASK_TEMPLATE_DAO = taskTemplateDao;
	}

	public TaskTemplate create(CreateTaskTemplateForm form) {
		TaskTemplate taskTemplate = new TaskTemplate();
		return update(taskTemplate, form);
	}

	public TaskTemplate update(TaskTemplate taskTemplate, CreateTaskTemplateForm form) {
		taskTemplate.setName(form.name);
		taskTemplate.setParent(form.parent);
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

		public TaskTemplate parent;

		public String validate() {
			if (parent != null && parent.getParent() != null) {
				return "Can not create sub-sub-task (two layers).";
			}
			return null;
		}
	}
}
