package controllers;

import daos.AbstractDatabaseTest;
import logics.user.UserLogic;
import models.user.User;
import play.api.mvc.HandlerRef;
import play.mvc.Result;
import play.test.FakeRequest;

import java.util.HashMap;
import java.util.Map;

import static play.test.Helpers.callAction;

public abstract class AbstractControllerTest extends AbstractDatabaseTest {

	protected static Result callPostAction(HandlerRef<?> target, String... postParamsKeyValuePairs) {
		final Map<String, String> postData = new HashMap<>();
		for (int i = 0; i < postParamsKeyValuePairs.length; i += 2) {
			postData.put(postParamsKeyValuePairs[i], postParamsKeyValuePairs[i + 1]);
		}
		return callPostAction(target, postData);
	}

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

}
