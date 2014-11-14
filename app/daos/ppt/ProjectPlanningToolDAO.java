package daos.ppt;

import daos.AbstractDAO;
import models.ppt.ProjectPlanningTool;

public class ProjectPlanningToolDAO extends AbstractDAO<ProjectPlanningTool> {

	public ProjectPlanningTool readTheOnlyOne() {
		return readAll().get(0);
	}

}
