package controllers.user;

import controllers.AbstractReadController;
import controllers.GuaranteeAuthenticatedUser;
import daos.user.ProjectDAO;
import logics.docs.DocumentationLogic;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import org.jetbrains.annotations.NotNull;
import controllers.Transactional;
import play.mvc.Result;

public class ProjectController extends AbstractReadController {

	private final ProjectDAO PROJECT_DAO;

	public ProjectController(ProjectDAO projectDao, DocumentationLogic documentationLogic) {
		super(documentationLogic);
		PROJECT_DAO = projectDao;
	}

	@NotNull
	@Override
	protected String getEntityName() {
		return "Project";
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns one Project.")
	@QueryExamples({
			@QueryExamples.Example(id = "9999", parameters = {}),
			@QueryExamples.Example(id = "REFERENCE_PROJECT_1000000000000000059", parameters = {})
	})
	public Result read(long id) {
		return read(PROJECT_DAO, id);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns all Projects.")
	public Result readAll() {
		return readAll(PROJECT_DAO);
	}

}
