package docs;

import views.html.documentation;
import play.mvc.Controller;
import play.mvc.Result;

public class DocumentationController extends Controller {

	public static final DocumentationLogic DOCUMENTATION_LOGIC = new DocumentationLogic();

	public static Result getAPIDocumentation() {
		return ok(documentation.render(DOCUMENTATION_LOGIC.getAllAPICalls(), DOCUMENTATION_LOGIC));
	}

}
