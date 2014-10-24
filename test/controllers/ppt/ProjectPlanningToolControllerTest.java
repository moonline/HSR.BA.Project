package controllers.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import controllers.AbstractControllerTest;
import models.user.User;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import play.libs.F;
import play.libs.Json;
import play.libs.ws.WS;
import play.libs.ws.WSRequestHolder;
import play.libs.ws.WSResponse;
import play.mvc.Result;
import test.AbstractTestDataCreator;

import static org.fest.assertions.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.when;
import static org.mockito.internal.verification.VerificationModeFactory.atLeastOnce;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.spy;
import static org.powermock.api.mockito.PowerMockito.*;
import static play.test.Helpers.contentAsString;
import static play.test.Helpers.status;


@RunWith(PowerMockRunner.class)
@PrepareForTest(WS.class)
@PowerMockIgnore({"javax.management.*", "javax.crypto.*", "javax.net.ssl.*", "org.apache.http.conn.ssl.*"})
public class ProjectPlanningToolControllerTest extends AbstractControllerTest {

	@Test
	public void testSendToPPTWithGoodData() throws Throwable {
		//Setup
		User user = AbstractTestDataCreator.createUserWithTransaction("User 1", "1");
		String baseUrl = "http://localhost:1234";
		String urlPath = "/testPath";
		String username = "admin";
		String password = "1234";
		String account = AbstractTestDataCreator.createPPTAccountWithTransaction(user, baseUrl, username, password).getId() + "";
		String content_string = "{\"content\": \"Test content\"}";
		JsonNode content = Json.parse(content_string);
		int result_status = 123;
		String result_json_string = "{\"result\":\"Check!\"}";
		JsonNode result_json = Json.parse(result_json_string);

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(result_status);
		when(response.asJson()).thenReturn(result_json);

		WSRequestHolder wsURL = spy(WS.url(baseUrl + urlPath));
		when(wsURL.post(content)).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(baseUrl + urlPath)).thenReturn(wsURL);

		//Test
		Result result = callActionWithUser(routes.ref.ProjectPlanningToolController.sendToPPT(), user, postData("path", urlPath, "content", content_string, "account", account));

		//Verification
		assertThat(status(result)).isEqualTo(result_status);
		assertThat(contentAsString(result)).isEqualTo(result_json_string);

		verifyStatic(atLeastOnce());
		WS.url(baseUrl + urlPath);
		verify(wsURL).setAuth(username, password);
	}


}