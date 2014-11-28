package selenium;

import org.junit.Test;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.fest.assertions.Assertions.assertThat;

public class SeleniumExampleTest extends AbstractSeleniumTest {

	@Test
	public void exampleTest() {
		browser.goTo("/");
		browser.await().atMost(30, SECONDS).untilPage().isLoaded();
		assertThat(browser.pageSource()).contains("EEPPI");
		assertThat(browser.pageSource()).contains("Login");
	}

}
