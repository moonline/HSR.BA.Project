package selenium;

import com.google.common.base.Predicate;
import external.AbstractVagrantTest;
import org.fluentlenium.core.domain.FluentList;
import org.fluentlenium.core.domain.FluentWebElement;
import org.fluentlenium.core.filter.FilterConstructor;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import static external.AbstractVagrantTest.checkIfVagrantTestsExcluded;
import static external.AbstractVagrantTest.vagrantTestsExcluded;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.fest.assertions.Assertions.assertThat;
import static org.fluentlenium.core.filter.FilterConstructor.withText;

public class FullWorkflowTest extends AbstractSeleniumTest {

	private static final String username = "demo";
	private static final String password = "demo";
	private static final String VAGRANT_PATH = "test/tools/vagrants/ADRepo";

	@BeforeClass
	public static void startApp() {
		if (!vagrantTestsExcluded()) {
			AbstractVagrantTest.vagrantUp(VAGRANT_PATH);
		}
	}

	@AfterClass
	public static void stopApp() {
		if (!vagrantTestsExcluded()) {
			AbstractVagrantTest.vagrantDestroy(VAGRANT_PATH);
		}
	}

	@Override
	public void setUp() {
		super.setUp();
	}

	@Override
	public void tearDown() {
		super.tearDown();
	}

	@Test
	public void registerAndLoginTest() {
		String username = "New User";
		String password = "1234";
		browser.goTo("/");
		browser.click("a", withText("Account"));
		browser.await().untilPage().isLoaded();
		browser.fill("#registerUserName").with(username);
		browser.fill("#registerPassword").with(password);
		browser.fill("#registerPasswordRepeat").with(password);
		browser.click("button", withText().contains("Register"));
		await(() -> browser.find(".messagebox.success", withText("Registration successful.")));
		doLogin(username, password);
		await(() -> browser.find("a", withText("Problems & Task Templates")));
		await(() -> browser.find("a", withText("Administration")));
		browser.click("button", withText("Logout"));
		assertThat(browser.find("a", withText("Problems & Task Templates"))).isEmpty();
		assertThat(browser.find("a", withText("Administration"))).isEmpty();
	}

	private FluentList<FluentWebElement> await(Await await) {
		browser.await().pollingEvery(50, MILLISECONDS).atMost(30, SECONDS).until((Predicate) input -> {
			browser.await().untilPage().isLoaded();
			try {
				return !await.element().isEmpty();
			} catch (org.openqa.selenium.StaleElementReferenceException sere) {
				return false;
			}
		});
		return await.element();
	}

	private interface Await {
		public FluentList<FluentWebElement> element();
	}

	private void doLogin(String username, String password) {
		browser.fill("input", FilterConstructor.with("placeholder").equalTo("username")).with(username);
		browser.fill("input", FilterConstructor.with("placeholder").equalTo("password")).with(password);
		browser.click("button", withText("Login"));
	}

	@Test
	public void mapSomethingTest() {
		//Setup
		checkIfVagrantTestsExcluded("selenium.FullWorkflowTest.mapSomethingTest");
		browser.goTo("/");
		doLogin(username, password);
		await(() -> browser.find("a", withText("Problems & Task Templates")));

		//Test
		browser.click("a", withText("Problems & Task Templates"));
		await(() -> browser.find("span", withText().contains("Amount of (Desired) Automation"))).click();
		await(() -> browser.find("p", withText("Should the business process (a.k.a. workflow) be fully or partially automated?")));
		browser.find("li", withText().contains("Define criterion values")).findFirst("button", withText("< Map")).click();
		browser.find("li", withText().contains("Define criterions")).findFirst("button", withText("< Map")).click();
		browser.find("li", withText().contains("Install DB")).findFirst("button", withText("< Map")).click();
		browser.find(".ProblemDetail li", withText().contains("Install DB")).findFirst("button", withText().contains("Unmap")).click();
		browser.fill("input", FilterConstructor.with("placeholder").equalTo("Name")).with("Hold final decision meeting");
		browser.click("button", withText().contains("Create"));
		await(() -> browser.find("#newTaskPropertySelect"));
		browser.fillSelect("#newTaskPropertySelect").withText("Assignee");
		browser.fill("input", FilterConstructor.with("placeholder").equalTo("New Assignee")).with("Developer");
		browser.click("button", withText().contains("Add"));
		browser.find("li", withText().contains("Hold final decision meeting")).findFirst("button", withText("< Map")).click();
		assertThat(await(() -> browser.find(".propertyValues input")).getValue()).isEqualTo("Developer");

		//Cleanup
		browser.click("button", withText("Logout"));
	}

}
