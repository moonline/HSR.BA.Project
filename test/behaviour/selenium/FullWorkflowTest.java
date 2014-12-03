package selenium;

import com.google.common.base.Predicate;
import org.fluentlenium.core.domain.FluentList;
import org.fluentlenium.core.domain.FluentWebElement;
import org.fluentlenium.core.filter.FilterConstructor;
import org.junit.Test;

import static org.fest.assertions.Assertions.assertThat;
import static org.fluentlenium.core.filter.FilterConstructor.withText;

public class FullWorkflowTest extends AbstractSeleniumTest {

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

	private void await(Await await) {
		Predicate predicate = input -> !await.element().isEmpty();
		browser.await().until(predicate);
	}

	private interface Await {
		public FluentList<FluentWebElement> element();
	}

	private void doLogin(String username, String password) {
		browser.fill("input", FilterConstructor.with("placeholder").equalTo("username")).with(username);
		browser.fill("input", FilterConstructor.with("placeholder").equalTo("password")).with(password);
		browser.click("button", withText("Login"));
	}

}
