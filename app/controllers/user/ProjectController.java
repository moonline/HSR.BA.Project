package controllers.user;

import controllers.AbstractController;
import controllers.GuaranteeAuthenticatedUser;
import daos.user.ProjectDAO;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryResponses;
import play.db.jpa.Transactional;
import play.mvc.Result;

public class ProjectController extends AbstractController {

	private final ProjectDAO PROJECT_DAO;

	public ProjectController(ProjectDAO projectDao) {
		PROJECT_DAO = projectDao;
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns the only existing Project.")
	@QueryResponses({
			@QueryResponses.Response(status = OK, description = "It is returned as Json.")
	})
	@QueryExamples({@QueryExamples.Example(parameters = {})})
	public Result read() {
		return ok(jsonify(PROJECT_DAO.readTheOnlyOne()));
	}

}
