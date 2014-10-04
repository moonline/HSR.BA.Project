package selenium;

import org.junit.Test;

import static org.fest.assertions.Assertions.assertThat;

public class SeleniumExampleTest extends AbstractSeleniumTest {

	@Test
	public void exampleTest() {
		browser.goTo("/");
		assertThat(browser.pageSource()).contains("Your new application is ready.");
	}

}
