package controllers.docs;

import logics.docs.DocumentationLogic;
import logics.docs.ExampleDataCreator;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.documentation;

import java.util.List;
import java.util.Map;

public class DocumentationController extends Controller {

	private final DocumentationLogic DOCUMENTATION_LOGIC;

	private ExampleDataCreator EXAMPLE_DATA_CREATOR;

	public DocumentationController(DocumentationLogic documentationLogic, ExampleDataCreator exampleDataCreator) {
		DOCUMENTATION_LOGIC = documentationLogic;
		EXAMPLE_DATA_CREATOR = exampleDataCreator;
	}

	@Transactional
	public Result getAPIDocumentation() {
		Map<Class<? extends Controller>, List<DocumentationLogic.MethodDocumentation>> allAPICalls = DOCUMENTATION_LOGIC.getAllAPICalls();
		DOCUMENTATION_LOGIC.createCallExampleData(allAPICalls.values(), EXAMPLE_DATA_CREATOR);
		JPA.em().flush();
		return ok(documentation.render(allAPICalls, DOCUMENTATION_LOGIC, EXAMPLE_DATA_CREATOR));
	}

}
