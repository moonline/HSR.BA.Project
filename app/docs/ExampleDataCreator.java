package docs;

import daos.AbstractDAO;
import daos.ppt.ProjectPlanningToolDAO;
import daos.user.PPTAccountDAO;
import daos.user.UserDAO;
import logics.user.UserLogic;
import models.ppt.ProjectPlanningTool;
import models.user.PPTAccount;
import models.user.User;
import org.apache.commons.lang3.NotImplementedException;
import play.Logger;
import play.db.jpa.JPA;

import javax.persistence.EntityManager;
import java.util.HashSet;
import java.util.Set;

public class ExampleDataCreator {

	public static final UserLogic USER_LOGIC = new UserLogic();
	public static final UserDAO USER_DAO = new UserDAO();
	public static final PPTAccountDAO PPT_ACCOUNT_DAO = new PPTAccountDAO();

	private Set<String> cache = new HashSet<>();

	public final String USER_NAME;

	public static final String USER_PASSWORD = "ZvGjYpyJdU";

	public final Long USER_ID;

	public ExampleDataCreator() {
		int i = 0;
		User user;
		String username;
		do {
			username = "user" + i;
			user = USER_DAO.readByName(username);
			if (user == null) {
				user = USER_LOGIC.createUser(username, USER_PASSWORD);
				JPA.em().flush();
			}
		} while (!USER_LOGIC.passwordCorrect(user, USER_PASSWORD));
		USER_NAME = username;
		USER_ID = user.getId();
	}

	public void createObject(String reference, boolean canBeCached) {
		ExampleObjectCreator objectCreator;
		String[] referenceParts = reference.split("_");
		switch (referenceParts[1]) {
			case "PPTACCOUNT":
				String pptUrl = "https://ppt.example.com";
				String ppt_username = "tbucher";
				String ppt_password = "7YqupNxN9v";
				objectCreator = new ExampleObjectCreator<>(
						"PPTAccount",
						PPT_ACCOUNT_DAO,
						() -> {
							ProjectPlanningTool ppt = new ProjectPlanningTool();
							ppt.setName("Example Project Planning Tool");

							PPTAccount pptAccount = new PPTAccount();
							pptAccount.setPpt(ppt);
							pptAccount.setPptUrl(pptUrl);
							pptAccount.setPptUsername(ppt_username);
							pptAccount.setPptPassword(ppt_password);
							pptAccount.setUser(USER_DAO.readById(USER_ID));

							persist(ppt, pptAccount);

							return pptAccount.getId();
						},
						(existingPPTAccount) -> (
								existingPPTAccount.getPptUrl().equals(pptUrl)
										&& existingPPTAccount.getPptUsername().equals(ppt_username)
										&& existingPPTAccount.getPptPassword().equals(ppt_password)));
				break;
			case "PPT":
				String pptName = "Example Jira";
				objectCreator = new ExampleObjectCreator<>("ProjectPlanningTool",
						new ProjectPlanningToolDAO(),
						() -> {
							ProjectPlanningTool ppt = new ProjectPlanningTool();
							ppt.setName(pptName);
							persist(ppt);
							return ppt.getId();
						},
						account -> account.getName().equals(pptName));
				break;
			default:
				throw new NotImplementedException("Example-object-creation not implemented for " + referenceParts[1]);
		}
		doCreateObject(reference, canBeCached, objectCreator, Long.parseLong(referenceParts[2]));
	}

	private static class ExampleObjectCreator<T> {
		private final String className;
		private final AbstractDAO<T> dao;
		private final Function0<Long> createNewFunction;
		private final Function<T, Boolean> isExistingAndExpectedFunction;

		public ExampleObjectCreator(String className, AbstractDAO<T> dao, Function0<Long> createNewFunction, Function<T, Boolean> isExistingAndExpectedFunction) {
			this.className = className;
			this.dao = dao;
			this.createNewFunction = createNewFunction;
			this.isExistingAndExpectedFunction = isExistingAndExpectedFunction;
		}

		public void create(long id) {
			T existingPPTAccount = dao.readById(id);
			if (existingPPTAccount == null) {
				Long currentId = createNewFunction.apply();
				JPA.em().createQuery("update " + className + " p set p.id=:new where p.id=:old").setParameter("old", currentId).setParameter("new", id).executeUpdate();
			} else {
				if (!isExistingAndExpectedFunction.apply(existingPPTAccount)) {
					Logger.error("Could not create Example Data " + className + " with ID " + id + ", because it already exists. The problem is, this existing object is exposed to every use as example of the documentation: " + existingPPTAccount);
				}
			}
		}
	}

	/**
	 * A Function with no arguments.
	 */
	public static interface Function0<R> {
		public R apply();
	}

	/**
	 * A Function with a single argument.
	 */
	public static interface Function<A, R> {
		public R apply(A a);
	}


	private void persist(Object... objectsToPersist) {
		EntityManager em = JPA.em();
		for (Object objectToPersist : objectsToPersist) {
			em.persist(objectToPersist);
		}
		em.flush();
	}

	private void doCreateObject(String reference, boolean canBeCached, ExampleObjectCreator function, long id) {
		if (canBeCached && cache.contains(reference)) {
			return;
		}
		try {
			function.create(id);
		} catch (Throwable throwable) {
			Logger.error("Could not create example object " + reference, throwable);
		}
		if (canBeCached) {
			cache.add(reference);
		}
	}

}
