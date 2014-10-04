package selenium;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.Dimension;
import play.api.test.Helpers$;
import play.test.Helpers;
import play.test.TestBrowser;
import play.test.TestServer;

import static play.test.Helpers.FIREFOX;
import static play.test.Helpers.inMemoryDatabase;

public class AbstractSeleniumTest {
	protected TestServer server;
	protected TestBrowser browser;

	@Before
	public void setUp() {
		server = Helpers.testServer(Helpers$.MODULE$.testServerPort(), Helpers.fakeApplication(inMemoryDatabase()));
		Helpers.start(server);
		browser = Helpers.testBrowser(FIREFOX);
		browser.manage().window().setSize(new Dimension(1000, 700));
	}

	@After
	public void tearDown() {
		try {
			browser.quit();
			Helpers.stop(server);
		} catch (Throwable e) {
			throw new RuntimeException(e);
		}
	}
}
