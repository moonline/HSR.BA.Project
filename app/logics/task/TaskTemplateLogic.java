package logics.task;

import daos.task.TaskPropertyValueDAO;
import daos.task.TaskTemplateDAO;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;
import models.task.TaskTemplate;
import play.data.validation.Constraints;
import play.db.jpa.JPA;

public class TaskTemplateLogic {

	private final TaskTemplateDAO TASK_TEMPLATE_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public TaskTemplateLogic(TaskTemplateDAO taskTemplateDao, TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_TEMPLATE_DAO = taskTemplateDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
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

	public TaskTemplate addProperty(TaskTemplate taskTemplate, TaskPropertyForm taskPropertyForm) {
		TaskPropertyValue taskPropertyValue = new TaskPropertyValue();
		taskPropertyValue.setTaskTemplate(taskTemplate);
		taskPropertyValue.setValue(taskPropertyForm.value);
		taskPropertyValue.setProperty(taskPropertyForm.property);
		TASK_PROPERTY_VALUE_DAO.persist(taskPropertyValue);
		TASK_PROPERTY_VALUE_DAO.flush();
		JPA.em().refresh(taskTemplate);
		return taskTemplate;
	}

	public TaskTemplate updateProperty(TaskPropertyValue taskPropertyValue, TaskPropertyForm taskPropertyForm) {
		taskPropertyValue.setValue(taskPropertyForm.value);
		taskPropertyValue.setProperty(taskPropertyForm.property);
		return taskPropertyValue.getTaskTemplate();
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

	public static class TaskPropertyForm {
		@Constraints.Required
		public String value;
		@Constraints.Required
		public TaskProperty property;
	}
}
