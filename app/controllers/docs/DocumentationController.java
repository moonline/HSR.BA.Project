package controllers.docs;

import daos.user.PPTAccountDAO;
import daos.user.UserDAO;
import logics.docs.DocumentationLogic;
import logics.docs.ExampleDataCreator;
import logics.user.UserLogic;
import play.db.jpa.JPA;
import play.libs.F;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.documentation;

import java.util.List;
import java.util.Map;

import static java.util.concurrent.TimeUnit.SECONDS;

public class DocumentationController extends Controller {

	private final DocumentationLogic DOCUMENTATION_LOGIC;
	private final UserLogic USER_LOGIC;
	private final UserDAO USER_DAO;
	private final PPTAccountDAO PPT_ACCOUNT_DAO;

	private ExampleDataCreator exampleDataCreator;

	public DocumentationController(DocumentationLogic documentationLogic, UserLogic userLogic, UserDAO userDao, PPTAccountDAO pptAccountDao) {
		DOCUMENTATION_LOGIC = documentationLogic;
		USER_LOGIC = userLogic;
		USER_DAO = userDao;
		PPT_ACCOUNT_DAO = pptAccountDao;
	}

	public F.Promise<Result> getAPIDocumentation() {
		Map<Class<? extends Controller>, List<DocumentationLogic.MethodDocumentation>> allAPICalls = DOCUMENTATION_LOGIC.getAllAPICalls();
		//Prepare example data with first transaction
		return F.Promise.delayed(() -> JPA.withTransaction(() -> {
			getExampleDataCreator();
			DOCUMENTATION_LOGIC.createCallExampleData(allAPICalls.values(), exampleDataCreator);
			return exampleDataCreator;
		}), 10, SECONDS)
				//Use example data in another transaction
				.map(exampleDataCreator -> JPA.withTransaction(() -> ok(documentation.render(allAPICalls, DOCUMENTATION_LOGIC, exampleDataCreator))));
	}

	private ExampleDataCreator getExampleDataCreator() {
		if (exampleDataCreator == null) {
			exampleDataCreator = new ExampleDataCreator(USER_LOGIC, USER_DAO, PPT_ACCOUNT_DAO);
		}
		return exampleDataCreator;
	}

}
