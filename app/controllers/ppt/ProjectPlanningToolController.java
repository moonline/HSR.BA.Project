package controllers.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AbstractReadController;
import controllers.AuthenticationChecker;
import controllers.GuaranteeAuthenticatedUser;
import controllers.Transactional;
import daos.ppt.ProjectPlanningToolDAO;
import daos.user.PPTAccountDAO;
import logics.docs.*;
import logics.ppt.PPTTaskLogic;
import models.user.PPTAccount;
import org.jetbrains.annotations.NotNull;
import play.data.Form;
import play.libs.F;
import play.mvc.Result;

import java.net.ConnectException;
import java.util.concurrent.TimeoutException;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;
import static logics.docs.QueryResponses.Response;

public class ProjectPlanningToolController extends AbstractReadController {

	private final PPTTaskLogic PPT_TASK_LOGIC;
	private final ProjectPlanningToolDAO PROJECT_PLANNING_TOOL_DAO;
	private final AuthenticationChecker AUTHENTICATION_CHECKER;
	private final PPTAccountDAO PPT_ACCOUNT_DAO;

	public ProjectPlanningToolController(PPTTaskLogic pptTaskLogic, ProjectPlanningToolDAO projectPlanningToolDao, AuthenticationChecker authenticationChecker, PPTAccountDAO pptAccountDao, DocumentationLogic documentationLogic) {
		super(documentationLogic);
		PPT_TASK_LOGIC = pptTaskLogic;
		PROJECT_PLANNING_TOOL_DAO = projectPlanningToolDao;
		AUTHENTICATION_CHECKER = authenticationChecker;
		PPT_ACCOUNT_DAO = pptAccountDao;
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
			@Response(status = BAD_GATEWAY, description = "If the remote server could not be found."),
			@Response(status = GATEWAY_TIMEOUT, description = "If the remote server did not respond."),
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
		if (!form.hasErrors()) {
			PPTAccount account = PPT_ACCOUNT_DAO.readByUser(AUTHENTICATION_CHECKER.getLoggedInUser(ctx()), form.get().account.getId());
			if (account == null) {
				form.reject("account", "Could not find account on server");
			} else {
				return F.Promise.promise(() -> withTransaction(() -> PPT_TASK_LOGIC.createPPTTask(form.get(), account))).map(wsResponse -> {
							//noinspection CodeBlock2Expr
							return (Result) status(wsResponse.getFinalResponseStatus(), wsResponse.getFinalResponseContent());
						}
				).recover(throwable -> {
					if (throwable instanceof ConnectException) {
						return status(BAD_GATEWAY, jsonify("Could not connect to " + form.get().account.getPptUrl() + "."));
					} else if (throwable instanceof TimeoutException) {
						return status(GATEWAY_TIMEOUT, jsonify(form.get().account.getPptUrl() + " did not respond."));
					} else {
						throw throwable;
					}
				});
			}
		}
		return F.Promise.pure(badRequest(form.errorsAsJson()));
	}

	@NotNull
	@Override
	protected String getEntityName() {
		return "Project Planning Tool";
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns one Project Planning Tool.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_PPT_1000000000000000051", parameters = {})
	})
	public Result read(long id) {
		return read(PROJECT_PLANNING_TOOL_DAO, id);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns all Project Planning Tools.")
	public Result readAll() {
		return readAll(PROJECT_PLANNING_TOOL_DAO);
	}

}
