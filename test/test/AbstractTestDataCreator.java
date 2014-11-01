package test;

import daos.user.UserDAO;
import logics.user.UserLogic;
import models.ppt.ProjectPlanningTool;
import models.task.TaskTemplate;
import models.user.PPTAccount;
import models.user.User;
import play.db.jpa.JPA;

import javax.persistence.EntityManager;
import java.security.SecureRandom;

public abstract class AbstractTestDataCreator {

	public static User createUserWithTransaction(final String name, final String password) throws Throwable {
		return JPA.withTransaction(() -> createUser(name, password));

	}

	public static User createUser(String name, String password) {
		return new UserLogic(new UserDAO(), new SecureRandom()).createUser(new UserLogic.RegisterForm(name, password));
	}

	public static PPTAccount createPPTAccountWithTransaction(User user, String pptUrl, String pptUsername, String pptPassword) {
		final PPTAccount account = new PPTAccount();
		account.setPptPassword(pptPassword);
		account.setPptUsername(pptUsername);
		account.setPptUrl(pptUrl);
		account.setUser(user);
		persistAndFlushInTransaction(account);
		return account;
	}

	public static ProjectPlanningTool createProjectPlanningToolWithTransaction() throws Throwable {
		ProjectPlanningTool ppt = new ProjectPlanningTool();
		ppt.setName("My Project Planning Tool");
		persistAndFlushInTransaction(ppt);
		return ppt;
	}

	private static void persistAndFlushInTransaction(Object entity) {
		JPA.withTransaction(() -> persistAndFlush(entity));
	}

	private static void persistAndFlush(Object entity) {
		EntityManager em = JPA.em();
		em.persist(entity);
		em.flush();
	}

	public static TaskTemplate createTaskTemplateWithTransaction(String name) throws Throwable {
		return JPA.withTransaction(() -> createTaskTemplate(name));
	}

	public static TaskTemplate createTaskTemplate(String name) {
		return createTaskTemplate(name, null);
	}

	public static TaskTemplate createTaskTemplate(String name, TaskTemplate parent) {
		TaskTemplate taskTemplate = new TaskTemplate();
		taskTemplate.setName(name);
		taskTemplate.setParent(parent);
		persistAndFlush(taskTemplate);
		return taskTemplate;
	}
}
