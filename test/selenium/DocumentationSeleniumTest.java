package selenium;

import controllers.docs.routes;
import org.junit.Test;

import static org.fest.assertions.Assertions.assertThat;

public class DocumentationSeleniumTest extends AbstractSeleniumTest {

	@Test
	public void testDocumentation() throws Throwable {
		browser.goTo(routes.DocumentationController.getAPIDocumentation().url());
		assertThat(browser.pageSource()).contains("API Documentation for EEPPI");
		assertThat(browser.pageSource()).contains("GET /dks/getFromDKS?url=&lt;id&gt;");
		assertThat(browser.pageSource()).contains("user</span><span class=\"pun\">/</span><span class=\"pln\">pptAccount</span><span class=\"pun\">/</span><span class=\"lit\">3");
		assertThat(browser.pageSource()).doesNotContain(routes.DocumentationController.getAPIDocumentation().url());
	}

}
