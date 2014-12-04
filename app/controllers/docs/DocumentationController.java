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

	public DocumentationController(DocumentationLogic documentationLogic) {
		super(documentationLogic);
		DOCUMENTATION_LOGIC = documentationLogic;
	}

	public Result getAPIDocumentation() throws Throwable {
		final Map<Class<? extends Controller>, List<DocumentationLogic.MethodDocumentation>> allAPICalls = DOCUMENTATION_LOGIC.getAllAPICalls();
		ExampleDataCreator exampleDataCreator = JPA.withTransaction(DocumentationLogic.DOCUMENTATION_PERSISTENCE_UNIT, false, () -> DOCUMENTATION_LOGIC.createCallExampleData(allAPICalls.values()));
		return JPA.withTransaction(DocumentationLogic.DOCUMENTATION_PERSISTENCE_UNIT, true, () -> ok(documentation.render(allAPICalls, DOCUMENTATION_LOGIC, exampleDataCreator)));
	}

}
