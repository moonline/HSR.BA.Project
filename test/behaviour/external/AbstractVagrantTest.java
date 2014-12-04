package external;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.jetbrains.annotations.Nullable;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import play.Logger;
import test.AbstractDatabaseTest;

import java.io.File;
import java.io.IOException;

public class AbstractVagrantTest extends AbstractDatabaseTest {

	public static final String LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_KEY = "testScope";
	public static final String LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_VALUE = "noVagrantTests";

	protected static boolean vagrantTestsExcluded() {
		return vagrantTestsExcluded(null);
	}

	protected static boolean vagrantTestsExcluded(@Nullable String testName) {
		Config config = ConfigFactory.load();
		boolean isExcluded = config.hasPath(LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_KEY) &&
				config.getString(LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_KEY).equals(LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_VALUE);
		if (isExcluded && testName != null) {
			String excludeMessage = "Ignoring " + testName + " due to launch parameter: " + LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_KEY + "=" + LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_VALUE;
			Logger.info(excludeMessage);
			System.out.println(excludeMessage);
		}
		return isExcluded;
	}

	@BeforeClass
	public static void startApp() {
		if (!vagrantTestsExcluded()) {
			AbstractDatabaseTest.startApp();
		}
	}

	@AfterClass
	public static void stopApp() {
		if (!vagrantTestsExcluded()) {
			AbstractDatabaseTest.stopApp();
		}
	}

	static void startAppWithVagrant(String vagrantPath) {
		if (vagrantTestsExcluded()) {
			return;
		}
		startApp();
		try {
			Runtime.getRuntime().exec("vagrant up", null, new File(vagrantPath)).waitFor();
		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
	}

	static void stopAppWithVagrant(String vagrantPath) {
		if (vagrantTestsExcluded()) {
			return;
		}
		try {
			Runtime.getRuntime().exec("vagrant destroy -f", null, new File(vagrantPath)).waitFor();
		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
		stopApp();
	}

	@Override
	public void setUp() {
		if (!vagrantTestsExcluded()) {
			super.setUp();
		}
	}

	@Override
	public void tearDown() {
		if (!vagrantTestsExcluded()) {
			super.tearDown();
		}
	}
}
