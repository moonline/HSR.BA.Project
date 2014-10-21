package logics.tasks;

import com.fasterxml.jackson.databind.JsonNode;
import models.user.PPTAccount;
import org.jetbrains.annotations.NotNull;
import play.data.validation.Constraints;
import play.libs.ws.WS;
import play.libs.ws.WSRequestHolder;
import play.libs.ws.WSResponse;

import static java.util.concurrent.TimeUnit.SECONDS;

public class PPTTaskLogic {

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

	public WSResponse createPPTTask(@NotNull CreatePPTTaskForm form) {
		PPTAccount account = form.account;
		return sendCreatePPTTaskRequest(account.getPptUrl() + form.path, form.content, account.getPpt_username(), account.getPpt_password());
	}

	public static class CreatePPTTaskForm {
		@Constraints.Required
		public PPTAccount account;
		@Constraints.Required
		public String path;
		@Constraints.Required
		public JsonNode content;
	}

}
