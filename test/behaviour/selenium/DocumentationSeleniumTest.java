package selenium;

import controllers.docs.routes;
import org.junit.Test;

import static org.fest.assertions.Assertions.assertThat;

public class DocumentationSeleniumTest extends AbstractSeleniumTest {

	@Test
	public void testDocumentation() throws Throwable {
		browser.goTo(routes.DocumentationController.getAPIDocumentation().url());
		assertThat(browser.pageSource()).contains("API Documentation for EEPPI");
		assertThat(browser.pageSource()).contains("GET /rest/api/1/dks/getFromDKS?url=&lt;url&gt;");
		assertThat(browser.pageSource()).doesNotContain(routes.DocumentationController.getAPIDocumentation().url());
	}

}
