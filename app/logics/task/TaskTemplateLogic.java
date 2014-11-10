package logics.task;

import daos.task.TaskPropertyValueDAO;
import daos.task.TaskTemplateDAO;
import logics.CRUDLogicInterface;
import models.task.TaskTemplate;
import play.data.validation.Constraints;

public class TaskTemplateLogic extends WorkLogic implements CRUDLogicInterface<TaskTemplate, TaskTemplateLogic.TaskTemplateForm, TaskTemplateLogic.TaskTemplateForm> {

	private final TaskTemplateDAO TASK_TEMPLATE_DAO;

	public TaskTemplateLogic(TaskTemplateDAO taskTemplateDao, TaskPropertyValueDAO taskPropertyValueDao) {
		super(taskPropertyValueDao);
		TASK_TEMPLATE_DAO = taskTemplateDao;
	}

	public TaskTemplate create(TaskTemplateForm form) {
		TaskTemplate taskTemplate = new TaskTemplate();
		return update(taskTemplate, form);
	}

	public TaskTemplate update(TaskTemplate taskTemplate, TaskTemplateForm form) {
		taskTemplate.setName(form.name);
		taskTemplate.setParent(form.parent);
		return TASK_TEMPLATE_DAO.persist(taskTemplate);
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Override
	public String delete(TaskTemplate entity) {
		if (canBeDeleted(entity)) {
			TASK_TEMPLATE_DAO.remove(entity);
			return null;
		}
		return "There is at least one child task template for this.";
	}

	private boolean canBeDeleted(TaskTemplate taskTemplate) {
		return TASK_TEMPLATE_DAO.readChildren(taskTemplate).isEmpty();
	}

	public static class TaskTemplateForm {
		@Constraints.Required
		public String name;

		public TaskTemplate parent;

		@SuppressWarnings("UnusedDeclaration") //Used by Play Framework to validate form
		public String validate() {
			if (parent != null && parent.getParent() != null) {
				return "Can not create sub-sub-task (two layers).";
			}
			return null;
		}
	}

}
