package controllers.docs;

import controllers.AbstractController;
import logics.docs.DocumentationLogic;
import logics.docs.ExampleDataCreator;
import play.db.jpa.JPA;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.documentation;

import java.util.List;
import java.util.Map;

public class DocumentationController extends AbstractController {

	private final DocumentationLogic DOCUMENTATION_LOGIC;

	private ExampleDataCreator EXAMPLE_DATA_CREATOR;

	public DocumentationController(DocumentationLogic documentationLogic, ExampleDataCreator exampleDataCreator) {
		DOCUMENTATION_LOGIC = documentationLogic;
		EXAMPLE_DATA_CREATOR = exampleDataCreator;
	}

	public Result getAPIDocumentation() throws Throwable {
		final Map<Class<? extends Controller>, List<DocumentationLogic.MethodDocumentation>> allAPICalls = DOCUMENTATION_LOGIC.getAllAPICalls();
		JPA.withTransaction(() -> DOCUMENTATION_LOGIC.createCallExampleData(allAPICalls.values(), EXAMPLE_DATA_CREATOR));
		return JPA.withTransaction("default", true, () -> ok(documentation.render(allAPICalls, DOCUMENTATION_LOGIC, EXAMPLE_DATA_CREATOR)));
	}

}
