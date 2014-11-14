package logics.task;

import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import logics.CRUDLogicInterface;
import models.task.TaskProperty;

public class TaskPropertyLogic implements CRUDLogicInterface<TaskProperty, TaskProperty, TaskProperty> {

	private final TaskPropertyDAO TASK_PROPERTY_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public TaskPropertyLogic(TaskPropertyDAO taskPropertyDao, TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_PROPERTY_DAO = taskPropertyDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
	}

	@Override
	public TaskProperty create(TaskProperty createForm) {
		TaskProperty taskProperty = new TaskProperty();
		return update(taskProperty, createForm);
	}

	@Override
	public TaskProperty update(TaskProperty entity, TaskProperty updateForm) {
		entity.setName(updateForm.getName());
		return TASK_PROPERTY_DAO.persist(entity);
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Override
	public String delete(TaskProperty entity) {
		if (canBeDeleted(entity)) {
			TASK_PROPERTY_DAO.remove(entity);
			return null;
		}
		return "There is at least one Task Property Value for this Task Property.";
	}

	private boolean canBeDeleted(TaskProperty taskProperty) {
		return TASK_PROPERTY_VALUE_DAO.readByProperty(taskProperty).isEmpty();
	}

}
