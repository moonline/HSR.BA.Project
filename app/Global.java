import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import controllers.AuthenticationChecker;
import controllers.TransactionalAction;
import controllers.dks.DecisionKnowledgeSystemController;
import controllers.dks.DecisionKnowledgeSystemMappingController;
import controllers.docs.DocumentationController;
import controllers.ppt.ProcessorController;
import controllers.ppt.ProjectPlanningToolController;
import controllers.ppt.RequestTemplateController;
import controllers.task.TaskPropertyController;
import controllers.task.TaskTemplateController;
import controllers.user.PPTAccountController;
import controllers.user.ProjectController;
import controllers.user.UserController;
import daos.dks.DKSMappingDAO;
import daos.dks.DecisionKnowledgeSystemDAO;
import daos.ppt.ProcessorDAO;
import daos.ppt.ProjectPlanningToolDAO;
import daos.ppt.RequestTemplateDAO;
import daos.task.TaskDAO;
import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import daos.task.TaskTemplateDAO;
import daos.user.PPTAccountDAO;
import daos.user.ProjectDAO;
import daos.user.UserDAO;
import logics.Logger;
import logics.dks.DKSMappingLogic;
import logics.dks.DecisionKnowledgeSystemLogic;
import logics.docs.DocumentationLogic;
import logics.ppt.PPTTaskLogic;
import logics.ppt.ProcessorLogic;
import logics.ppt.RequestTemplateLogic;
import logics.task.TaskPropertyLogic;
import logics.task.TaskTemplateLogic;
import logics.user.PPTAccountLogic;
import logics.user.UserLogic;
import models.ppt.Processor;
import models.ppt.ProjectPlanningTool;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;
import models.task.TaskTemplate;
import models.user.PPTAccount;
import models.user.Project;
import org.jetbrains.annotations.NotNull;
import play.Application;
import play.GlobalSettings;
import play.data.format.Formatters;
import play.db.jpa.JPA;
import play.libs.F;
import play.libs.Json;
import play.mvc.Action;
import play.mvc.Http;
import play.mvc.Result;

import java.lang.reflect.Method;
import java.security.SecureRandom;
import java.text.ParseException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static play.mvc.Controller.ctx;
import static play.mvc.Results.notFound;

@SuppressWarnings("UnusedDeclaration")
public class Global extends GlobalSettings {

	private static final Logger LOGGER = new Logger("application.access");
	private final DecisionKnowledgeSystemDAO DKS_DAO = new DecisionKnowledgeSystemDAO();
	private final ProcessorDAO PROCESSOR_DAO = new ProcessorDAO();
	private final TaskDAO TASK_DAO = new TaskDAO();
	private final ProjectDAO PROJECT_DAO = new ProjectDAO();
	private final RequestTemplateDAO REQUEST_TEMPLATE_DAO = new RequestTemplateDAO();
	private final TaskPropertyDAO TASK_PROPERTY_DAO = new TaskPropertyDAO();
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO = new TaskPropertyValueDAO();
	private final DKSMappingDAO DKS_MAPPING_DAO = new DKSMappingDAO();
	private final ProjectPlanningToolDAO PROJECT_PLANNING_TOOL_DAO = new ProjectPlanningToolDAO();
	private final TaskTemplateDAO TASK_TEMPLATE_DAO = new TaskTemplateDAO();
	private final UserDAO USER_DAO = new UserDAO();
	private final PPTAccountDAO PPT_ACCOUNT_DAO = new PPTAccountDAO();

	private final RequestTemplateLogic REQUEST_TEMPLATE_LOGIC = new RequestTemplateLogic(REQUEST_TEMPLATE_DAO);
	private final TaskPropertyLogic TASK_PROPERTY_LOGIC = new TaskPropertyLogic(TASK_PROPERTY_DAO, TASK_PROPERTY_VALUE_DAO);
	private final DecisionKnowledgeSystemLogic DKS_LOGIC = new DecisionKnowledgeSystemLogic(DKS_DAO);
	private final DKSMappingLogic DKS_MAPPING_LOGIC = new DKSMappingLogic(DKS_MAPPING_DAO);
	private final PPTTaskLogic PPT_TASK_LOGIC = new PPTTaskLogic(TASK_DAO, TASK_PROPERTY_VALUE_DAO);
	private final TaskTemplateLogic TASK_TEMPLATE_LOGIC = new TaskTemplateLogic(TASK_TEMPLATE_DAO, TASK_PROPERTY_VALUE_DAO);
	private final UserLogic USER_LOGIC = new UserLogic(USER_DAO, new SecureRandom());
	private final PPTAccountLogic PPT_ACCOUNT_LOGIC = new PPTAccountLogic(PPT_ACCOUNT_DAO);
	private final AuthenticationChecker AUTHENTICATION_CHECKER = new AuthenticationChecker(USER_DAO, USER_LOGIC);
	private final ProcessorLogic PROCESSOR_LOGIC = new ProcessorLogic(PROCESSOR_DAO);
	private final DocumentationLogic DOCUMENTATION_LOGIC = new DocumentationLogic(USER_LOGIC, USER_DAO, PPT_ACCOUNT_DAO, PROJECT_PLANNING_TOOL_DAO, TASK_TEMPLATE_DAO, TASK_PROPERTY_DAO, TASK_PROPERTY_VALUE_DAO, DKS_MAPPING_DAO, REQUEST_TEMPLATE_DAO, PROJECT_DAO, PROCESSOR_DAO, DKS_DAO);

	private final Map<Class, Object> CONTROLLERS = new HashMap<>();

	@Override
	public void onStart(Application app) {
		super.onStart(app);
		registerFormatters();
		registerJsonObjectMappers();
		initializeControllersRequiringParameters();
		fixSQLInitializationBug();
	}

	private void fixSQLInitializationBug() {
		for (String db : new String[]{"default", DocumentationLogic.DOCUMENTATION_PERSISTENCE_UNIT}) {
			try {
				JPA.withTransaction(db, false, () -> {
					for (Processor processor : PROCESSOR_DAO.readAll()) {
						processor.setCode(processor.getCode().replaceAll("&#SEMICOLON", ";"));
						PROCESSOR_DAO.persist(processor);
					}
					//noinspection ConstantConditions
					return null;
				});
			} catch (Throwable throwable) {
				play.Logger.error("Could not fix SQL initialization bug in " + db, throwable);
			}
		}
	}

	private void registerJsonObjectMappers() {
		Json.setObjectMapper(new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT));
	}

	private void registerFormatters() {
		Formatters.register(PPTAccount.class, new Formatters.SimpleFormatter<PPTAccount>() {
			@Override
			public PPTAccount parse(@NotNull String accountId, Locale l) throws ParseException {
				if (accountId.matches("\\d+")) {
					PPTAccount authentication = PPT_ACCOUNT_LOGIC.read(AUTHENTICATION_CHECKER.getLoggedInUser(ctx()), Long.parseLong(accountId));
					if (authentication != null) {
						return authentication;
					}
				}
				throw new ParseException("No valid input", 0);
			}

			@Override
			public String print(@NotNull PPTAccount account, Locale l) {
				return account.getId() + "";
			}

		});
		Formatters.register(JsonNode.class, new Formatters.SimpleFormatter<JsonNode>() {
			@Override
			public JsonNode parse(String string, Locale l) throws ParseException {
				return Json.parse(string);
			}

			@Override
			public String print(@NotNull JsonNode json, Locale l) {
				return Json.stringify(json);
			}

		});
		Formatters.register(ProjectPlanningTool.class, new Formatters.SimpleFormatter<ProjectPlanningTool>() {
			@Override
			public ProjectPlanningTool parse(@NotNull String text, Locale locale) throws ParseException {
				return PROJECT_PLANNING_TOOL_DAO.readById(Long.parseLong(text));
			}

			@Override
			public String print(@NotNull ProjectPlanningTool projectPlanningTool, Locale locale) {
				return projectPlanningTool.getId() + "";
			}
		});
		Formatters.register(TaskTemplate.class, new Formatters.SimpleFormatter<TaskTemplate>() {
			@Override
			public TaskTemplate parse(@NotNull String text, Locale locale) throws ParseException {
				return TASK_TEMPLATE_DAO.readById(Long.parseLong(text));
			}

			@Override
			public String print(@NotNull TaskTemplate taskTemplate, Locale locale) {
				return taskTemplate.getId() + "";
			}
		});
		Formatters.register(TaskProperty.class, new Formatters.SimpleFormatter<TaskProperty>() {
			@Override
			public TaskProperty parse(@NotNull String text, Locale locale) throws ParseException {
				return TASK_PROPERTY_DAO.readById(Long.parseLong(text));
			}

			@Override
			public String print(@NotNull TaskProperty taskProperty, Locale locale) {
				return taskProperty.getId() + "";
			}
		});
		Formatters.register(TaskPropertyValue.class, new Formatters.SimpleFormatter<TaskPropertyValue>() {
			@Override
			public TaskPropertyValue parse(@NotNull String text, Locale locale) throws ParseException {
				if (text.matches("\\d+")) {
					return TASK_PROPERTY_VALUE_DAO.readById(Long.parseLong(text));
				} else {
					Matcher matcher = Pattern.compile("(\\d+)-(.*)").matcher(text);
					if (matcher.matches()) {
						TaskProperty taskProperty = TASK_PROPERTY_DAO.readById(Long.parseLong(matcher.group(1)));
						if (taskProperty != null) {
							TaskPropertyValue taskPropertyValue = new TaskPropertyValue();
							taskPropertyValue.setProperty(taskProperty);
							taskPropertyValue.setValue(matcher.group(2));
							return taskPropertyValue;
						}
					}
				}
				throw new ParseException(text, 0);
			}

			@Override
			public String print(@NotNull TaskPropertyValue taskPropertyValue, Locale locale) {
				return taskPropertyValue.getId() + "";
			}
		});
		Formatters.register(Project.class, new Formatters.SimpleFormatter<Project>() {
			@Override
			public Project parse(@NotNull String text, Locale locale) throws ParseException {
				return PROJECT_DAO.readById(Long.parseLong(text));
			}

			@Override
			public String print(@NotNull Project project, Locale locale) {
				return project.getId() + "";
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
		CONTROLLERS.put(DocumentationController.class, new DocumentationController(DOCUMENTATION_LOGIC));
		CONTROLLERS.put(PPTAccountController.class, new PPTAccountController(PPT_ACCOUNT_DAO, PPT_ACCOUNT_LOGIC, AUTHENTICATION_CHECKER, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(UserController.class, new UserController(USER_LOGIC, AUTHENTICATION_CHECKER, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(TaskTemplateController.class, new TaskTemplateController(TASK_TEMPLATE_LOGIC, TASK_TEMPLATE_DAO, TASK_PROPERTY_VALUE_DAO, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(ProjectPlanningToolController.class, new ProjectPlanningToolController(PPT_TASK_LOGIC, PROJECT_PLANNING_TOOL_DAO, AUTHENTICATION_CHECKER, PPT_ACCOUNT_DAO, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(DecisionKnowledgeSystemController.class, new DecisionKnowledgeSystemController(DKS_LOGIC, DKS_DAO, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(AuthenticationChecker.Authenticator.class, AUTHENTICATION_CHECKER.new Authenticator());
		CONTROLLERS.put(TransactionalAction.class, new TransactionalAction(DOCUMENTATION_LOGIC));
		CONTROLLERS.put(TaskPropertyController.class, new TaskPropertyController(TASK_PROPERTY_LOGIC, TASK_PROPERTY_DAO, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(DecisionKnowledgeSystemMappingController.class, new DecisionKnowledgeSystemMappingController(DKS_MAPPING_LOGIC, DKS_MAPPING_DAO, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(RequestTemplateController.class, new RequestTemplateController(REQUEST_TEMPLATE_LOGIC, REQUEST_TEMPLATE_DAO, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(ProjectController.class, new ProjectController(PROJECT_DAO, DOCUMENTATION_LOGIC));
		CONTROLLERS.put(ProcessorController.class, new ProcessorController(PROCESSOR_LOGIC, PROCESSOR_DAO, DOCUMENTATION_LOGIC));
	}

	@Override
	public F.Promise<Result> onHandlerNotFound(Http.RequestHeader request) {
		return F.Promise.pure(notFound(views.html.notFound.render()));
	}

	/**
	 * Call to create the root Action of a request for a Java application.
	 * The request and actionMethod values are passed for information.
	 *
	 * @param request      The HTTP Request
	 * @param actionMethod The action method containing the user code for this Action.
	 * @return The default implementation returns a raw Action calling the method.
	 */
	@Override
	public Action onRequest(Http.Request request, Method actionMethod) {
		return new Action.Simple() {
			/**
			 * Executes this action with the given HTTP context and returns the result.
			 */
			@Override
			public F.Promise<Result> call(Http.Context ctx) throws Throwable {
				LOGGER.debug("called " + actionMethod.getDeclaringClass().getCanonicalName() + "#" + actionMethod.getName() + "()");
				return delegate.call(ctx);
			}


		};
	}
}
