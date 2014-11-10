package controllers.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AbstractController;
import controllers.GuaranteeAuthenticatedUser;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import logics.ppt.PPTTaskLogic;
import play.data.Form;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.libs.F;
import play.mvc.Http;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;
import static logics.docs.QueryResponses.Response;

public class ProjectPlanningToolController extends AbstractController {

	private final PPTTaskLogic PPT_TASK_LOGIC;

	public ProjectPlanningToolController(PPTTaskLogic pptTaskLogic) {
		PPT_TASK_LOGIC = pptTaskLogic;
	}

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
	@Deprecated
	public F.Promise<Result> sendToPPT() {
		Form<PPTTaskLogic.CreatePPTTaskWithoutStoringForm> form = Form.form(PPTTaskLogic.CreatePPTTaskWithoutStoringForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return F.Promise.pure(badRequest(form.errorsAsJson()));
		}
		return F.Promise.promise(() ->
						PPT_TASK_LOGIC.createPPTTaskWithoutStoring(form.get())
		).map(wsResponse ->
						status(wsResponse.getStatus(), wsResponse.asJson())
		);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@Parameter(name = "account", format = Long.class, description = "The id of an EEPPI-account of the currently logged in user."),
			@Parameter(name = "path", description = "The path on the remote server beginning with a '/'"),
			@Parameter(name = "content", format = JsonNode.class, description = "Json-data to be sent to the remote server"),
			@Parameter(name = "taskTemplate", format = Long.class, description = "The id of a TaskTemplate of which this Task is created."),
			@Parameter(name = "taskProperties[]", format = String.class, description = "This parameter can be passed multiple times. It represents a Task Property Value for this Task. The Format is \"{ID of the Task Property}-{The Value of it}\"."),
			@Parameter(name = "project", format = Long.class, description = "The id of a Project in which this Task is created.")
	})
	@QueryDescription("Creates a Task on a remote Project Planning Tool Server and stores the creation on the server.")
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
			"}",
			"51",
			"53-Example Value",
			"55"},
			response = @Example.Response(status = 201, content = "{\n" +
					"    \"id\": \"10000\",\n" +
					"    \"key\": \"PRV-24\",\n" +
					"    \"self\": \"http://jira.example.ch/jira/rest/api/2/issue/10000\"\n" +
					"}")),
			@Example(parameters = {"not a number", "not a path", "no Json", "wrongFormat", "9999"})
	})
	public F.Promise<Result> createPPTTask() {
		Form<PPTTaskLogic.CreatePPTTaskForm> form = Form.form(PPTTaskLogic.CreatePPTTaskForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return F.Promise.pure(badRequest(form.errorsAsJson()));
		}
		return F.Promise.promise(() -> {
			Http.Context.current.remove();
			return JPA.withTransaction(() -> PPT_TASK_LOGIC.createPPTTask(form.get()));
		}).map(wsResponse ->
						status(wsResponse.getStatus(), wsResponse.asJson())
		);
	}

}
