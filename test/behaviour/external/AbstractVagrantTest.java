package external;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.junit.AfterClass;
import org.junit.Assume;
import org.junit.BeforeClass;
import test.AbstractDatabaseTest;

import javax.validation.constraints.NotNull;
import java.io.File;
import java.io.IOException;

public class AbstractVagrantTest extends AbstractDatabaseTest {

	public static final String LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_KEY = "testScope";
	public static final String LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_VALUE = "noVagrantTests";

	public static boolean vagrantTestsExcluded() {
		Config config = ConfigFactory.load();
		return config.hasPath(LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_KEY) &&
				config.getString(LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_KEY).equals(LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_VALUE);
	}

	public static void checkIfVagrantTestsExcluded(@NotNull String testName) {
		boolean isExcluded = vagrantTestsExcluded();
		Assume.assumeFalse("Ignoring " + testName + " due to launch parameter: " + LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_KEY + "=" + LAUNCH_PARAMETER_TO_EXCLUDE_VAGRANT_TESTS_VALUE, isExcluded);
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

	public static void startAppWithVagrant(String vagrantPath) {
		if (vagrantTestsExcluded()) {
			return;
		}
		startApp();
		vagrantUp(vagrantPath);
	}

	public static void vagrantUp(String vagrantPath) {
		try {
			Runtime.getRuntime().exec("vagrant up", null, new File(vagrantPath)).waitFor();
		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
	}

	public static void stopAppWithVagrant(String vagrantPath) {
		if (vagrantTestsExcluded()) {
			return;
		}
		vagrantDestroy(vagrantPath);
		stopApp();
	}

	public static void vagrantDestroy(String vagrantPath) {
		try {
			Runtime.getRuntime().exec("vagrant destroy -f", null, new File(vagrantPath)).waitFor();
		} catch (InterruptedException | IOException e) {
			e.printStackTrace();
		}
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
