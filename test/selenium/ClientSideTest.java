package selenium;

import org.junit.Test;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.fest.assertions.Assertions.assertThat;

public class ClientSideTest extends AbstractSeleniumTest {

	@Test
	public void exampleTest() {
		//Test
		browser.goTo("/public/test/index.html");
		browser.await().atMost(30, SECONDS).untilPage().isLoaded();
		//Verification
		String pageSource = browser.pageSource();
		assertThat(pageSource).contains(" 0 failures");
		assertThat(pageSource).doesNotContain("No specs found");
		assertThat(pageSource).doesNotContain("pending specs");
		assertThat(getNumberOfClientTests(pageSource)).isGreaterThan(15);
	}

	private int getNumberOfClientTests(String pageSource) {
		Matcher numberOfTestsRun = Pattern.compile("[\\w\\W]*?(\\d+) specs[\\w\\W]*").matcher(pageSource);
		assertThat(numberOfTestsRun.matches()).isTrue();
		return Integer.parseInt(numberOfTestsRun.group(1));
	}

}
