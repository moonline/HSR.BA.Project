package daos.task;

import daos.AbstractDAO;
import models.task.TaskTemplate;

import java.util.List;

public class TaskTemplateDAO extends AbstractDAO<TaskTemplate> {

	public List<TaskTemplate> readChildren(TaskTemplate parent) {
		return findAll("select tt from TaskTemplate tt where tt.parent=?", parent);
	}

	@Override
	public List<TaskTemplate> readAll() {
		return findAll("select t from TaskTemplate t order by LOWER(t.name), t.name");
	}
}
