import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import controllers.AuthenticationChecker;
import controllers.dks.DecisionKnowledgeSystemController;
import controllers.docs.DocumentationController;
import controllers.ppt.ProjectPlanningToolController;
import controllers.task.TaskTemplateController;
import controllers.user.PPTAccountController;
import controllers.user.UserController;
import daos.ppt.ProjectPlanningToolDAO;
import daos.task.TaskTemplateDAO;
import daos.user.PPTAccountDAO;
import daos.user.UserDAO;
import logics.dks.DecisionKnowledgeSystemLogic;
import logics.docs.DocumentationLogic;
import logics.docs.ExampleDataCreator;
import logics.ppt.PPTTaskLogic;
import logics.task.TaskTemplateLogic;
import logics.user.PPTAccountLogic;
import logics.user.UserLogic;
import models.ppt.ProjectPlanningTool;
import models.task.TaskTemplate;
import models.user.PPTAccount;
import play.Application;
import play.GlobalSettings;
import play.data.format.Formatters;
import play.libs.F;
import play.libs.Json;
import play.mvc.Http;
import play.mvc.Result;

import java.security.SecureRandom;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import static play.mvc.Controller.ctx;
import static play.mvc.Results.notFound;

@SuppressWarnings("UnusedDeclaration")
public class Global extends GlobalSettings {

	private final ProjectPlanningToolDAO PROJECT_PLANNING_TOOL_DAO = new ProjectPlanningToolDAO();
	private final TaskTemplateDAO TASK_TEMPLATE_DAO = new TaskTemplateDAO();
	private final UserDAO USER_DAO = new UserDAO();
	private final PPTAccountDAO PPT_ACCOUNT_DAO = new PPTAccountDAO();

	private final DecisionKnowledgeSystemLogic DKS_LOGIC = new DecisionKnowledgeSystemLogic();
	private final PPTTaskLogic PPT_TASK_LOGIC = new PPTTaskLogic();
	private final DocumentationLogic DOCUMENTATION_LOGIC = new DocumentationLogic();
	private final TaskTemplateLogic TASK_TEMPLATE_LOGIC = new TaskTemplateLogic(TASK_TEMPLATE_DAO);
	private final UserLogic USER_LOGIC = new UserLogic(USER_DAO, new SecureRandom());
	private final PPTAccountLogic PPT_ACCOUNT_LOGIC = new PPTAccountLogic(PPT_ACCOUNT_DAO);
	private final AuthenticationChecker AUTHENTICATION_CHECKER = new AuthenticationChecker(USER_DAO, USER_LOGIC);

	private final Map<Class, Object> CONTROLLERS = new HashMap<>();

	@Override
	public void onStart(Application app) {
		super.onStart(app);
		registerFormatters();
		registerJsonObjectMappers();
		initializeControllersRequiringParameters();
	}

	private void registerJsonObjectMappers() {
		Json.setObjectMapper(new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT));
	}

	private void registerFormatters() {
		Formatters.register(PPTAccount.class, new Formatters.SimpleFormatter<PPTAccount>() {
			@Override
			public PPTAccount parse(String authenticationId, Locale l) throws ParseException {
				PPTAccount authentication = PPT_ACCOUNT_LOGIC.getAuthentication(AUTHENTICATION_CHECKER.getLoggedInUser(ctx()), authenticationId);
				if (authentication == null) {
					throw new ParseException("No valid input", 0);
				}
				return authentication;
			}

			@Override
			public String print(PPTAccount account, Locale l) {
				return account.getId() + "";
			}

		});
		Formatters.register(JsonNode.class, new Formatters.SimpleFormatter<JsonNode>() {
			@Override
			public JsonNode parse(String string, Locale l) throws ParseException {
				return Json.toJson(string);
			}

			@Override
			public String print(JsonNode json, Locale l) {
				return Json.stringify(json);
			}

		});
		Formatters.register(ProjectPlanningTool.class, new Formatters.SimpleFormatter<ProjectPlanningTool>() {
			@Override
			public ProjectPlanningTool parse(String text, Locale locale) throws ParseException {
				return PROJECT_PLANNING_TOOL_DAO.readById(Long.parseLong(text));
			}

			@Override
			public String print(ProjectPlanningTool projectPlanningTool, Locale locale) {
				return projectPlanningTool.getId() + "";
			}
		});
		Formatters.register(TaskTemplate.class, new Formatters.SimpleFormatter<TaskTemplate>() {
			@Override
			public TaskTemplate parse(String text, Locale locale) throws ParseException {
				return TASK_TEMPLATE_DAO.readById(Long.parseLong(text));
			}

			@Override
			public String print(TaskTemplate taskTemplate, Locale locale) {
				return taskTemplate.getId() + "";
			}
		});
	}

	@Override
	public <A> A getControllerInstance(Class<A> controllerClass) throws Exception {
		@SuppressWarnings("unchecked") A controller = (A) CONTROLLERS.get(controllerClass);
		if (controller == null) {
			controller = controllerClass.newInstance();
			CONTROLLERS.put(controllerClass, controller);
		}
		return controller;
	}

	private void initializeControllersRequiringParameters() {
		CONTROLLERS.put(DocumentationController.class, new DocumentationController(DOCUMENTATION_LOGIC, new ExampleDataCreator(USER_LOGIC, USER_DAO, PPT_ACCOUNT_DAO)));
		CONTROLLERS.put(PPTAccountController.class, new PPTAccountController(PPT_ACCOUNT_DAO, PPT_ACCOUNT_LOGIC, AUTHENTICATION_CHECKER));
		CONTROLLERS.put(UserController.class, new UserController(USER_LOGIC, AUTHENTICATION_CHECKER));
		CONTROLLERS.put(TaskTemplateController.class, new TaskTemplateController(TASK_TEMPLATE_LOGIC, TASK_TEMPLATE_DAO));
		CONTROLLERS.put(ProjectPlanningToolController.class, new ProjectPlanningToolController(PPT_TASK_LOGIC));
		CONTROLLERS.put(DecisionKnowledgeSystemController.class, new DecisionKnowledgeSystemController(DKS_LOGIC));
		CONTROLLERS.put(AuthenticationChecker.Authenticator.class, AUTHENTICATION_CHECKER.new Authenticator());
	}

	@Override
	public F.Promise<Result> onHandlerNotFound(Http.RequestHeader request) {
		return F.Promise.pure(notFound(views.html.notFound.render()));
	}
}
