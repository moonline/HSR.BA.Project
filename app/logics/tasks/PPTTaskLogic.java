package logics.tasks;

import com.fasterxml.jackson.databind.JsonNode;
import models.user.PPTAccount;
import org.jetbrains.annotations.NotNull;
import play.data.validation.Constraints;
import play.libs.ws.WS;
import play.libs.ws.WSResponse;

import static java.util.concurrent.TimeUnit.SECONDS;

public class PPTTaskLogic {

	public WSResponse createPPTTask(@NotNull CreatePPTTaskForm form) {
		PPTAccount account = form.account;
		return WS.url(account.getPptUrl() + form.path)
				.setHeader("Content-Type", "application/json")
				.setAuth(account.getPpt_username(), account.getPpt_password())
				.post(form.content)
				.get(30, SECONDS);
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
