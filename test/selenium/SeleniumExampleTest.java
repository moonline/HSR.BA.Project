package selenium;

import com.google.common.base.Predicate;
import org.junit.Test;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.fest.assertions.Assertions.assertThat;

public class SeleniumExampleTest extends AbstractSeleniumTest {

	@Test
	public void exampleTest() {
		browser.goTo("/#/register");
		//noinspection RedundantCast
		browser.await().atMost(30, SECONDS).until((Predicate) (Object input) -> browser.pageSource().contains("password repeat"));
		assertThat(browser.pageSource()).contains("EEPPI");
		assertThat(browser.pageSource()).contains("Login");
		assertThat(browser.pageSource()).contains("password repeat");
	}

}
