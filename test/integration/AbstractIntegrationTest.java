package integration;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import play.Logger;
import test.AbstractDatabaseTest;

public class AbstractIntegrationTest extends AbstractDatabaseTest {

	public static final String LAUNCH_PARAMETER_TO_EXCLUDE_INTEGRATION_TESTS_KEY = "testScope";
	public static final String LAUNCH_PARAMETER_TO_EXCLUDE_INTEGRATION_TESTS_VALUE = "noIntegrationTests";

	protected static boolean integrationTestsExcluded() {
		return integrationTestsExcluded(null);
	}

	protected static boolean integrationTestsExcluded(String testName) {
		Config config = ConfigFactory.load();
		boolean isExcluded = config.hasPath(LAUNCH_PARAMETER_TO_EXCLUDE_INTEGRATION_TESTS_KEY) &&
				config.getString(LAUNCH_PARAMETER_TO_EXCLUDE_INTEGRATION_TESTS_KEY).equals(LAUNCH_PARAMETER_TO_EXCLUDE_INTEGRATION_TESTS_VALUE);
		if (isExcluded && testName != null) {
			String excludeMessage = "Ignoring " + testName + " due to launch parameter: " + LAUNCH_PARAMETER_TO_EXCLUDE_INTEGRATION_TESTS_KEY + "=" + LAUNCH_PARAMETER_TO_EXCLUDE_INTEGRATION_TESTS_VALUE;
			Logger.info(excludeMessage);
			System.out.println(excludeMessage);
		}
		return isExcluded;
	}

	@BeforeClass
	public static void startApp() {
		if (!integrationTestsExcluded()) {
			AbstractDatabaseTest.startApp();
		}
	}

	@AfterClass
	public static void stopApp() {
		if (!integrationTestsExcluded()) {
			AbstractDatabaseTest.stopApp();
		}
	}

	@Override
	public void setUp() {
		if (!integrationTestsExcluded()) {
			super.setUp();
		}
	}

	@Override
	public void tearDown() {
		if (!integrationTestsExcluded()) {
			super.tearDown();
		}
	}
}
