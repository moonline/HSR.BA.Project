package logics.docs;

import daos.AbstractDAO;
import daos.ppt.ProjectPlanningToolDAO;
import daos.task.TaskTemplateDAO;
import daos.user.PPTAccountDAO;
import daos.user.UserDAO;
import logics.user.UserLogic;
import models.ppt.ProjectPlanningTool;
import models.task.TaskTemplate;
import models.user.PPTAccount;
import models.user.User;
import org.apache.commons.lang3.NotImplementedException;
import play.Logger;
import play.db.jpa.JPA;

import javax.persistence.EntityManager;
import java.util.HashSet;
import java.util.Set;

public class ExampleDataCreator {

	private final UserDAO USER_DAO;
	private final PPTAccountDAO PPT_ACCOUNT_DAO;

	private Set<String> cache = new HashSet<>();

	public final String USER_NAME;

	public final String USER_PASSWORD = "ZvGjYpyJdU";

	public final Long USER_ID;

	public ExampleDataCreator(UserLogic userLogic, UserDAO userDao, PPTAccountDAO pptAccountDao) {
		int i = 0;
		User user;
		String username;
		USER_DAO = userDao;
		PPT_ACCOUNT_DAO = pptAccountDao;
		do {
			username = "user" + i;
			user = USER_DAO.readByName(username);
			if (user == null) {
				user = userLogic.createUser(username, USER_PASSWORD);
				JPA.em().flush();
			}
		} while (!userLogic.passwordCorrect(user, USER_PASSWORD));
		USER_NAME = username;
		USER_ID = user.getId();
	}

	public void createObject(String reference, boolean canBeCached) {
		ExampleObjectCreator objectCreator;
		String[] referenceParts = reference.split("_");
		switch (referenceParts[1]) {
			case "PPTACCOUNT":
				String pptUrl = "https://ppt.example.com";
				String pptUsername = "tbucher";
				String pptPassword = "7YqupNxN9v";
				objectCreator = new ExampleObjectCreator<>(
						"PPTAccount",
						PPT_ACCOUNT_DAO,
						() -> {
							ProjectPlanningTool ppt = new ProjectPlanningTool();
							ppt.setName("Example Project Planning Tool");

							PPTAccount pptAccount = new PPTAccount();
							pptAccount.setPpt(ppt);
							pptAccount.setPptUrl(pptUrl);
							pptAccount.setPptUsername(pptUsername);
							pptAccount.setPptPassword(pptPassword);
							pptAccount.setUser(USER_DAO.readById(USER_ID));

							persist(ppt, pptAccount);

							return pptAccount.getId();
						},
						(existingPPTAccount) -> (
								existingPPTAccount.getPptUrl().equals(pptUrl)
										&& existingPPTAccount.getPptUsername().equals(pptUsername)
										&& existingPPTAccount.getPptPassword().equals(pptPassword)));
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
			case "TASKTEMPLATE":
				String ttName = "My example Task Template";
				objectCreator = new ExampleObjectCreator<>("TaskTemplate",
						new TaskTemplateDAO(),
						() -> {
							TaskTemplate taskTemplate = new TaskTemplate();
							taskTemplate.setName(ttName);
							persist(taskTemplate);
							return taskTemplate.getId();
						},
						existingTaskTemplate -> existingTaskTemplate.getName().equals(ttName));
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
