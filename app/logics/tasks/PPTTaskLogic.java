package logics.tasks;

import com.fasterxml.jackson.databind.JsonNode;
import logics.user.PPTAccountLogic;
import models.user.PPTAccount;
import models.user.User;
import play.libs.Json;
import play.libs.ws.WS;
import play.libs.ws.WSRequestHolder;
import play.libs.ws.WSResponse;

import static java.util.concurrent.TimeUnit.SECONDS;

public class PPTTaskLogic {

	private static final PPTAccountLogic PPT_ACCOUNT_LOGIC = new PPTAccountLogic();

	@Deprecated
	public boolean createPPTTask(String url, JsonNode postData, String username, String password) {
		WSResponse wsResponse = sendCreatePPTTaskRequest(url, postData, username, password);
		JsonNode response = wsResponse.asJson();
		return response.has("key");
	}

	private WSResponse sendCreatePPTTaskRequest(String url, JsonNode postData, String username, String password) {
		WSRequestHolder wsRequest = WS.url(url)
				.setHeader("Content-Type", "application/json")
				.setAuth(username, password);
		return wsRequest.post(postData).get(30, SECONDS);
	}

	public WSResponse createPPTTask(User user, String authentication_id, String url_path, String request_content) {
		PPTAccount authentication = PPT_ACCOUNT_LOGIC.getAuthentication(user, authentication_id);
		//todo: Create form-object for all parameters (and do the checks there)
		//todo: check authentication!=null
		//todo: check url_path starting with /
		//todo: check and convert request_content to json
		JsonNode request_content_json = Json.parse(request_content);
		return sendCreatePPTTaskRequest(authentication.getPptUrl() + url_path, request_content_json, authentication.getPpt_username(), authentication.getPpt_password());
	}

}
