package logics.tasks;

import com.fasterxml.jackson.databind.JsonNode;
import play.libs.ws.WS;
import play.libs.ws.WSRequestHolder;
import play.libs.ws.WSResponse;

import static java.util.concurrent.TimeUnit.SECONDS;

public class PPTTaskLogic {

	public boolean createPPTTask(String url, JsonNode postData) {
		WSRequestHolder wsRequest = WS.url(url)
				.setHeader("Content-Type", "application/json")
				.setAuth("admin", "admin");
		WSResponse wsResponse = wsRequest.post(postData).get(30, SECONDS);
		JsonNode response = wsResponse.asJson();
		return response.has("key");
	}

}
