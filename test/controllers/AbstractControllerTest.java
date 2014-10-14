package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import logics.user.UserLogic;
import models.user.User;
import play.api.mvc.HandlerRef;
import play.libs.Json;
import play.mvc.Result;
import play.test.FakeRequest;
import test.AbstractDatabaseTest;
import test.AbstractTestDataCreator;

import java.util.HashMap;
import java.util.Map;

import static org.fest.assertions.Assertions.assertThat;
import static play.test.Helpers.callAction;
import static play.test.Helpers.contentAsString;

public abstract class AbstractControllerTest extends AbstractDatabaseTest {

	private static int uniqueIdCounter = 0;

	protected static Result callPostAction(HandlerRef<?> target, Map<String, String> postData) {
		return callAction(target, new FakeRequest().withFormUrlEncodedBody(postData));
	}

	protected static Result callActionWithUser(HandlerRef<?> target, User user) {
		return callActionWithUser(target, user, new HashMap<String, String>(0));
	}

	protected static Result callActionWithUser(HandlerRef<?> target, User user, Map<String, String> postData) {
		FakeRequest fakeRequest = new FakeRequest().withFormUrlEncodedBody(postData);
		fakeRequest = fakeRequest.withSession(UserLogic.SESSION_USER_IDENTIFIER, user.getId() + "");
		return callAction(target, fakeRequest);
	}

	protected static Result callActionWithUser(HandlerRef<?> target) {
		return callActionWithUser(target, new HashMap<String, String>(0));
	}

	protected static Result callActionWithUser(HandlerRef<?> target, Map<String, String> postData) {
		User user = AbstractTestDataCreator.createUser("Benutzer " + uniqueIdCounter++, "1234");
		return callActionWithUser(target, user, postData);
	}

	protected static Map<String, String> postData(String... data) {
		final Map<String, String> postData = new HashMap<>();
		for (int i = 0; i < data.length; i += 2) {
			postData.put(data[i], data[i + 1]);
		}
		return postData;
	}

	protected void assertCheckJsonResponse(Result result, JsonNode expected) {
		String result_content = contentAsString(result);
		result_content = Json.stringify(Json.parse(result_content)); //format with "correct" spaces
		final String expected_content = Json.stringify(expected);
		assertThat(result_content).isEqualTo(expected_content);
	}

}
