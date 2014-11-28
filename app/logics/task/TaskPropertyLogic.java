package logics.task;

import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import logics.CRUDLogicInterface;
import models.task.TaskProperty;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class TaskPropertyLogic implements CRUDLogicInterface<TaskProperty> {

	private final TaskPropertyDAO TASK_PROPERTY_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public TaskPropertyLogic(TaskPropertyDAO taskPropertyDao, TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_PROPERTY_DAO = taskPropertyDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
	}

	@Override
	public TaskProperty create(@NotNull TaskProperty postedEntity) {
		TaskProperty taskProperty = new TaskProperty();
		return update(taskProperty, postedEntity);
	}

	@Override
	public TaskProperty update(@NotNull TaskProperty persistedEntity, @NotNull TaskProperty postedEntity) {
		persistedEntity.setName(postedEntity.getName());
		return TASK_PROPERTY_DAO.persist(persistedEntity);
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Nullable
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
