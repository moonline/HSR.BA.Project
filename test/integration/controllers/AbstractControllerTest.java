package controllers;

import com.fasterxml.jackson.databind.JsonNode;
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
		return callActionWithUser(target, user, new HashMap<>(0));
	}

	protected static Result callActionWithUser(HandlerRef<?> target, User user, Map<String, String> postData) {
		FakeRequest fakeRequest = new FakeRequest().withFormUrlEncodedBody(postData);
		fakeRequest = fakeRequest.withSession(AuthenticationChecker.SESSION_USER_IDENTIFIER, user.getId() + "");
		return callAction(target, fakeRequest, 40000);
	}

	protected static Result callActionWithUser(HandlerRef<?> target) throws Throwable {
		return callActionWithUser(target, new HashMap<>(0));
	}

	protected static Result callActionWithUser(HandlerRef<?> target, Map<String, String> postData) throws Throwable {
		User user = AbstractTestDataCreator.createUserWithTransaction("Benutzer " + uniqueIdCounter++, "1234");
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
		JsonNode resultJson = Json.parse(contentAsString(result));
		assertThat(resultJson.equals(expected)).describedAs("\n" + Json.stringify(expected) + "\n --- was expected but was --- \n" + Json.stringify(resultJson)).isTrue();
	}

}
