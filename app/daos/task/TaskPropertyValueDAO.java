package daos.task;

import daos.AbstractDAO;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;

import java.util.List;

public class TaskPropertyValueDAO extends AbstractDAO<TaskPropertyValue> {

	public List<TaskPropertyValue> readByProperty(TaskProperty property) {
		return findAll("select tpv from TaskPropertyValue tpv where tpv.property=?", property);
	}

}
