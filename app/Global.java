import com.fasterxml.jackson.databind.JsonNode;
import logics.user.PPTAccountLogic;
import logics.user.UserLogic;
import models.user.PPTAccount;
import play.Application;
import play.GlobalSettings;
import play.data.format.Formatters;
import play.libs.Json;

import java.text.ParseException;
import java.util.Locale;

import static play.mvc.Controller.session;

public class Global extends GlobalSettings {

	public static final PPTAccountLogic PPT_ACCOUNT_LOGIC = new PPTAccountLogic();
	public static final UserLogic USER_LOGIC = new UserLogic();

	@Override
	public void onStart(Application app) {
		super.onStart(app);
		registerFormatters();
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
	}
}
