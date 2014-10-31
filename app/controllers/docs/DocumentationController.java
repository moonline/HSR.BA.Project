package controllers.docs;

import logics.docs.DocumentationLogic;
import logics.docs.ExampleDataCreator;
import play.db.jpa.JPA;
import play.libs.F;
import play.mvc.Controller;
import play.mvc.Result;
import views.html.documentation;

import java.util.List;
import java.util.Map;

import static java.util.concurrent.TimeUnit.SECONDS;

public class DocumentationController extends Controller {

	public static final DocumentationLogic DOCUMENTATION_LOGIC = new DocumentationLogic();

	private static ExampleDataCreator exampleDataCreator;

	public static F.Promise<Result> getAPIDocumentation() {
		Map<Class<? extends Controller>, List<DocumentationLogic.MethodDocumentation>> allAPICalls = DOCUMENTATION_LOGIC.getAllAPICalls();
		//Prepare example data with first transaction
		return F.Promise.delayed(() -> JPA.withTransaction(() -> {
			DocumentationController.getExampleDataCreator();
			DOCUMENTATION_LOGIC.createCallExampleData(allAPICalls.values(), exampleDataCreator);
			return exampleDataCreator;
		}), 10, SECONDS)
				//Use example data in another transaction
				.map(exampleDataCreator -> JPA.withTransaction(() -> ok(documentation.render(allAPICalls, DOCUMENTATION_LOGIC, exampleDataCreator))));
	}

	private static ExampleDataCreator getExampleDataCreator() {
		if (exampleDataCreator == null) {
			exampleDataCreator = new ExampleDataCreator();
		}
		return exampleDataCreator;
	}

}
