package daos.user;

import daos.AbstractDAO;
import models.user.Project;
import org.jetbrains.annotations.NotNull;

public class ProjectDAO extends AbstractDAO<Project> {

	@NotNull
	public Project readTheOnlyOne() {
		return readAll().get(0);
	}

}
