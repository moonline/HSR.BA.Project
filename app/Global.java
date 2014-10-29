import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import daos.ppt.ProjectPlanningToolDAO;
import logics.user.PPTAccountLogic;
import logics.user.UserLogic;
import models.ppt.ProjectPlanningTool;
import models.user.PPTAccount;
import play.Application;
import play.GlobalSettings;
import play.data.format.Formatters;
import play.libs.F;
import play.libs.Json;
import play.mvc.Http;
import play.mvc.Result;

import java.text.ParseException;
import java.util.Locale;

import static play.mvc.Controller.session;
import static play.mvc.Results.notFound;

@SuppressWarnings("UnusedDeclaration")
public class Global extends GlobalSettings {

	public static final PPTAccountLogic PPT_ACCOUNT_LOGIC = new PPTAccountLogic();
	public static final UserLogic USER_LOGIC = new UserLogic();
	public static final ProjectPlanningToolDAO PROJECT_PLANNING_TOOL_DAO = new ProjectPlanningToolDAO();

	@Override
	public void onStart(Application app) {
		super.onStart(app);
		registerFormatters();
		registerJsonObjectMappers();
	}

	private void registerJsonObjectMappers() {
		Json.setObjectMapper(new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT));
	}

	private void registerFormatters() {
		Formatters.register(PPTAccount.class, new Formatters.SimpleFormatter<PPTAccount>() {
			@Override
			public PPTAccount parse(String authentication_id, Locale l) throws ParseException {
				PPTAccount authentication = PPT_ACCOUNT_LOGIC.getAuthentication(USER_LOGIC.getLoggedInUser(session()), authentication_id);
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
			public JsonNode parse(String json, Locale l) throws ParseException {
				return Json.parse(json);
			}

			@Override
			public String print(JsonNode json, Locale l) {
				return json.asText();
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
	}

	@Override
	public F.Promise<Result> onHandlerNotFound(Http.RequestHeader request) {
		return F.Promise.pure(notFound(views.html.notFound.render()));
	}
}
