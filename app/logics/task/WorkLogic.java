package logics.task;

import daos.task.TaskPropertyValueDAO;
import models.task.AbstractWork;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;
import play.data.validation.Constraints;
import play.db.jpa.JPA;

public class WorkLogic {

	protected final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public WorkLogic(TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
	}

	public AbstractWork addProperty(AbstractWork work, TaskPropertyForm taskPropertyForm) {
		TaskPropertyValue taskPropertyValue = new TaskPropertyValue();
		taskPropertyValue.setTask(work);
		taskPropertyValue.setValue(taskPropertyForm.value);
		taskPropertyValue.setProperty(taskPropertyForm.property);
		TASK_PROPERTY_VALUE_DAO.persist(taskPropertyValue);
		TASK_PROPERTY_VALUE_DAO.flush();
		JPA.em().refresh(work);
		return work;
	}

	public AbstractWork updateProperty(TaskPropertyValue taskPropertyValue, TaskPropertyForm taskPropertyForm) {
		taskPropertyValue.setValue(taskPropertyForm.value);
		taskPropertyValue.setProperty(taskPropertyForm.property);
		return taskPropertyValue.getTask();
	}

	public AbstractWork removeProperty(TaskPropertyValue taskPropertyValue) {
		AbstractWork work = taskPropertyValue.getTask();
		work.removeProperty(taskPropertyValue);
		TASK_PROPERTY_VALUE_DAO.remove(taskPropertyValue);
		TASK_PROPERTY_VALUE_DAO.flush();
		JPA.em().refresh(work);
		return work;
	}

	public static class TaskPropertyForm {
		@Constraints.Required
		public String value;
		@Constraints.Required
		public TaskProperty property;

		public String getValue() {
			return value;
		}

		public void setValue(String value) {
			this.value = value;
		}

		public TaskProperty getProperty() {
			return property;
		}

		public void setProperty(TaskProperty property) {
			this.property = property;
		}
	}
}
