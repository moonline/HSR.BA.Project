package logics.task;

import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import models.task.TaskProperty;
import play.data.validation.Constraints;

public class TaskPropertyLogic {

	private final TaskPropertyDAO TASK_PROPERTY_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public TaskPropertyLogic(TaskPropertyDAO taskPropertyDao, TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_PROPERTY_DAO = taskPropertyDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
	}

	public TaskProperty create(TaskPropertyForm form) {
		TaskProperty taskProperty = new TaskProperty();
		return update(taskProperty, form);
	}

	public TaskProperty update(TaskProperty taskProperty, TaskPropertyForm form) {
		taskProperty.setName(form.name);
		return TASK_PROPERTY_DAO.persist(taskProperty);
	}

	public boolean delete(TaskProperty taskProperty) {
		if (canBeDeleted(taskProperty)) {
			TASK_PROPERTY_DAO.remove(taskProperty);
			return true;
		}
		return false;
	}

	private boolean canBeDeleted(TaskProperty taskProperty) {
		return TASK_PROPERTY_VALUE_DAO.readByProperty(taskProperty).isEmpty();
	}

	public static class TaskPropertyForm {
		@Constraints.Required
		public String name;
	}
}
