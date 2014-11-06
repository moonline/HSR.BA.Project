package logics.task;

import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import logics.CRUDLogicInterface;
import models.task.TaskProperty;
import play.data.validation.Constraints;

public class TaskPropertyLogic implements CRUDLogicInterface<TaskProperty, TaskPropertyLogic.TaskPropertyForm, TaskPropertyLogic.TaskPropertyForm> {

	private final TaskPropertyDAO TASK_PROPERTY_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public TaskPropertyLogic(TaskPropertyDAO taskPropertyDao, TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_PROPERTY_DAO = taskPropertyDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
	}

	@Override
	public TaskProperty create(TaskPropertyForm createForm) {
		TaskProperty taskProperty = new TaskProperty();
		return update(taskProperty, createForm);
	}

	@Override
	public TaskProperty update(TaskProperty entity, TaskPropertyForm updateForm) {
		entity.setName(updateForm.name);
		return TASK_PROPERTY_DAO.persist(entity);
	}

	@Override
	public boolean delete(TaskProperty entity) {
		if (canBeDeleted(entity)) {
			TASK_PROPERTY_DAO.remove(entity);
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
