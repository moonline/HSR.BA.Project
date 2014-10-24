package controllers.dks;

import controllers.AbstractControllerTest;
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

import static org.fest.assertions.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.mockito.internal.verification.VerificationModeFactory.atLeastOnce;
import static org.powermock.api.mockito.PowerMockito.*;
import static play.test.Helpers.*;


@RunWith(PowerMockRunner.class)
@PrepareForTest(WS.class)
@PowerMockIgnore({"javax.management.*", "javax.crypto.*", "javax.net.ssl.*", "org.apache.http.conn.ssl.*"})
public class DecisionKnowledgeSystemControllerTest extends AbstractControllerTest {

	@Test
	public void testGetFromDKSWithGoodData() throws Throwable {
		//Setup
		String url = "http://localhost:1234/myPath";
		int result_status = 123;
		String result_json = "{\"result\":\"Check!\"}";

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(result_status);
		when(response.asJson()).thenReturn(Json.parse(result_json));

		WSRequestHolder wsURL = spy(WS.url(url));
		when(wsURL.get()).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(url)).thenReturn(wsURL);

		//Test
		Result result = callAction(controllers.dks.routes.ref.DecisionKnowledgeSystemController.getFromDKS(url));

		//Verification
		assertThat(status(result)).isEqualTo(result_status);
		assertThat(contentAsString(result)).isEqualTo(result_json);

		verifyStatic(atLeastOnce());
		WS.url(url);
	}


}
