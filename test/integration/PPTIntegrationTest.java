package integration;

import daos.task.TaskDAO;
import daos.task.TaskPropertyValueDAO;
import logics.ppt.PPTTaskLogic;
import org.apache.commons.lang3.StringUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import play.libs.Json;
import play.libs.ws.WS;
import play.libs.ws.WSCookie;
import play.libs.ws.WSRequestHolder;
import play.libs.ws.WSResponse;
import test.AbstractTestDataCreator;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.CREATED;

public class PPTIntegrationTest extends AbstractIntegrationTest {

	public static final String VAGRANT_PATH = "test/integration/PPT";
	public static final String JIRA_URL = "http://localhost:9920";
	private List<WSCookie> cookies = new ArrayList<>();

	@BeforeClass
	public static void startApp() {
		if (integrationTestsExcluded()) {
			return;
		}
		AbstractIntegrationTest.startApp();
		try {
			Runtime.getRuntime().exec("vagrant up", null, new File(PPTIntegrationTest.VAGRANT_PATH)).waitFor();
		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
	}

	@AfterClass
	public static void stopApp() {
		if (integrationTestsExcluded()) {
			return;
		}
		try {
			Runtime.getRuntime().exec("vagrant destroy -f", null, new File(VAGRANT_PATH)).waitFor();
		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
		AbstractIntegrationTest.stopApp();
	}

	@Test
	public void testEverything() throws Throwable {
		if (integrationTestsExcluded("integration.PPTIntegrationTest.testEverything")) {
			return;
		}
		System.out.println("PPTIntegrationTest.testLoginStatusForUser: START");

		String projectKey = "PRV";

		//Setup
		loginAsAdmin();
		addLicenseKeyAgain();
		createJiraProject(projectKey);

		//Create an issue
		{
			//Setup
			PPTTaskLogic.CreatePPTTaskWithoutStoringForm form = new PPTTaskLogic.CreatePPTTaskWithoutStoringForm();
			form.account = AbstractTestDataCreator.createPPTAccountWithTransaction(AbstractTestDataCreator.createUserWithTransaction("Admin", "123"), JIRA_URL, "admin", "admin");
			form.path = "/rest/api/2/issue/";
			form.content = Json.parse("{\n" +
					"    \"fields\": {\n" +
					"       \"project\":\n" +
					"       {\n" +
					"          \"key\": \"" + projectKey + "\"\n" +
					"       },\n" +
					"       \"summary\": \"My generated issue\",\n" +
					"       \"description\": \"This is an issue, which is created by EEPPI over the API\",\n" +
					"       \"issuetype\": {\n" +
					"          \"name\": \"Task\"\n" +
					"       }\n" +
					"   }\n" +
					"}");
			//Test
			WSResponse response = new PPTTaskLogic(new TaskDAO(), new TaskPropertyValueDAO()).createPPTTaskWithoutStoring(form);
			//Verification
			assertThat(response.getStatus()).isEqualTo(CREATED);
			assertThat(response.asJson().has("key")).isTrue();
		}

		System.out.println("PPTIntegrationTest.testLoginStatusForUser: END");
	}

	private void loginAsAdmin() {
		//Login
		WSResponse wsResponse = performPostRequest("/rest/gadget/1.0/login", "os_username=admin&os_password=admin&os_captcha=");
		assertThat(wsResponse.getStatus()).describedAs("login as admin").isEqualTo(200);
		assertThat(new String(wsResponse.asByteArray())).contains("\"loginSucceeded\":true");

		//Authenticate sudo
		wsResponse = performPostRequest("/secure/admin/WebSudoAuthenticate.jspa", "webSudoPassword=admin&decorator=dialog&inline=true&webSudoIsPost=false&close=true&_=1413538948243");
		assertThat(wsResponse.getStatus()).describedAs("web sudo authentication").isEqualTo(200);
	}

	private void addLicenseKeyAgain() throws IOException {
		String jiraLicenseKey = URLEncoder.encode(new String(Files.readAllBytes(Paths.get("test/integration/PPT/jira-license.key"))).trim(), "UTF-8");
		WSResponse wsResponse = performPostRequest("/secure/admin/ViewLicense.jspa", "license=" + jiraLicenseKey + "&Add=Add");
		assertThat(wsResponse.getStatus()).describedAs("add license key").isEqualTo(200);
		assertThat(contentAsString(wsResponse)).doesNotContain("Invalid JIRA license key specified");
		assertThat(contentAsString(wsResponse)).doesNotContain("Add License");
		assertThat(contentAsString(wsResponse)).contains("Update License");
	}

	private String contentAsString(WSResponse response) {
		return new String(response.asByteArray());
	}

	private void createJiraProject(String projectKey) {
		WSResponse wsResponse = performPostRequest("/rest/project-templates/1.0/templates", "name=Projekt_" + projectKey + "&key=" + projectKey + "&keyEdited=true&projectTemplateWebItemKey=com.atlassian.jira-core-project-templates%3Ajira-issuetracking-item&projectTemplateModuleKey=com.atlassian.jira-core-project-templates%3Ajira-issuetracking-item");
		assertThat(wsResponse.getStatus()).describedAs("create Jira project " + projectKey).isEqualTo(200);
	}

	private WSResponse performPostRequest(String url, String data) {
		WSRequestHolder wsRequest = WS.url(JIRA_URL + url)
				.setContentType("application/x-www-form-urlencoded")
				.setHeader("X-Atlassian-Token", "no-check");
		if (!cookies.isEmpty()) {
			wsRequest.setHeader("Cookie", getCookieString(cookies));
		}

		WSResponse wsResponse = wsRequest.post(data).get(120, SECONDS);
		updateCookieData(wsResponse.getCookies());
		return wsResponse;
	}

	private void updateCookieData(List<WSCookie> newCookies) {
		for (WSCookie newCookie : newCookies) {
			for (WSCookie existingCookie : cookies) {
				if (existingCookie.getName().equals(newCookie.getName())) {
					cookies.remove(existingCookie);
					break;
				}
			}
			cookies.add(newCookie);
		}
	}

	private String getCookieString(List<WSCookie> cookies) {
		List<String> cookieStrings = new ArrayList<>(cookies.size());
		for (WSCookie cookie : cookies) {
			cookieStrings.add(cookie.getName() + "=" + cookie.getValue());
		}
		return StringUtils.join(cookieStrings, "; ");
	}


}
