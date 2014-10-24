package docs;

import controllers.AbstractControllerTest;
import org.junit.Test;
import play.mvc.Result;

import static org.fest.assertions.Assertions.assertThat;
import static play.test.Helpers.*;

public class DocumentationControllerTest extends AbstractControllerTest {

	@Test
	public void testSendToPPTWithGoodData() throws Throwable {
		//Test
		Result result = callAction(routes.ref.DocumentationController.getAPIDocumentation());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertThat(contentAsString(result)).contains("API Documentation for EEPPI");
		assertThat(contentAsString(result)).contains("POST /user/register");
	}


}
