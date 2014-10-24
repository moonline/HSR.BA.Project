package controllers.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.GuaranteeAuthenticatedUser;
import docs.QueryDescription;
import docs.QueryExamples;
import docs.QueryParameters;
import docs.QueryResponses;
import logics.tasks.PPTTaskLogic;
import play.data.Form;
import play.db.jpa.Transactional;
import play.libs.F;
import play.mvc.Controller;
import play.mvc.Result;

import static docs.QueryExamples.Example;
import static docs.QueryParameters.Parameter;
import static docs.QueryResponses.Response;

public class ProjectPlanningToolController extends Controller {

	public static final PPTTaskLogic PPT_TASK_LOGIC = new PPTTaskLogic();

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@Parameter(name = "account", format = Long.class, description = "The id of an EEPPI-account of the currently logged in user."),
			@Parameter(name = "path", description = "The path on the remote server beginning with a '/'"),
			@Parameter(name = "content", format = JsonNode.class, description = "Json-data to be sent to the remote server")
	})
	@QueryDescription("Redirects a request to a remote server to avoid restrictions with Cross Origin Requests.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If there is an error during preparation of the request for the remote server."),
			@Response(status = 0, description = "The return value from the remote server is returned")
	})
	@QueryExamples({@Example(parameters = {"100", "/rest/api/2/issue/", "{\n" +
			"    \"fields\": {\n" +
			"       \"project\":\n" +
			"       {\n" +
			"          \"key\": \"PRV\"\n" +
			"       },\n" +
			"       \"summary\": \"My generated issue\",\n" +
			"       \"description\": \"This is an issue, which is created by EEPPI over the API\",\n" +
			"       \"issuetype\": {\n" +
			"          \"name\": \"Task\"\n" +
			"       }\n" +
			"   }\n" +
			"}"}, response = @Example.Response(status = 201, content = "{\n" +
			"    \"id\": \"10000\",\n" +
			"    \"key\": \"PRV-24\",\n" +
			"    \"self\": \"http://jira.example.ch/jira/rest/api/2/issue/10000\"\n" +
			"}")),
			@Example(parameters = {"not a number", "not a path", "no Json"})
	})
	public static F.Promise<Result> sendToPPT() {
		Form<PPTTaskLogic.CreatePPTTaskForm> form = Form.form(PPTTaskLogic.CreatePPTTaskForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return F.Promise.promise(() -> badRequest(form.errorsAsJson()));
		}
		return F.Promise.promise(() ->
						PPT_TASK_LOGIC.createPPTTask(form.get())
		).map(wsResponse ->
						status(wsResponse.getStatus(), wsResponse.asJson())
		);
	}

}