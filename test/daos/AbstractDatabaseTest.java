package daos;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import play.db.jpa.JPA;
import play.test.FakeApplication;
import play.test.Helpers;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;

import static play.test.Helpers.inMemoryDatabase;

public class AbstractDatabaseTest {

	private static FakeApplication app;
	private EntityManager em;
	private EntityTransaction tx;
	private boolean committed = false;

	@BeforeClass
	public static void startApp() {
		app = Helpers.fakeApplication(inMemoryDatabase());
		Helpers.start(app);
	}

	@AfterClass
	public static void stopApp() {
		Helpers.stop(app);
	}

	@Before
	public void setUp() {
		em = JPA.em("default");
		JPA.bindForCurrentThread(em);
		tx = em.getTransaction();
		tx.begin();
	}

	@After
	public void tearDown() {
		try {
			tx.rollback();
		} finally {
			JPA.bindForCurrentThread(null);
			if (em != null) {
				em.close();
			}
		}
		if (committed) {
			stopApp();
			startApp();
			committed = false;
		}
	}

	protected void flush() {
		JPA.em().flush();
	}

	protected void persistAndFlush(Object o) {
		JPA.em().persist(o);
		flush();
	}

	protected void persist(Object o) {
		JPA.em().persist(o);
	}

	protected void commit() {
		tx.commit();
		tx.begin();
		committed = true;
	}
}
