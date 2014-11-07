package test;

import daos.dks.DKSMappingDAO;
import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import daos.task.TaskTemplateDAO;
import daos.user.UserDAO;
import logics.user.UserLogic;
import models.dks.DKSMapping;
import models.ppt.ProjectPlanningTool;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;
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

	public static TaskProperty createTaskPropertyWithTransaction(String name) throws Throwable {
		return JPA.withTransaction(() -> createTaskProperty(name));
	}

	public static TaskProperty createTaskProperty(String name) {
		TaskProperty taskProperty = new TaskProperty();
		taskProperty.setName(name);
		persistAndFlush(taskProperty);
		return taskProperty;
	}

	public static TaskPropertyValue createTaskPropertyValue(String value, TaskProperty property, TaskTemplate taskTemplate) {
		TaskPropertyValue taskPropertyValue = new TaskPropertyValue();
		taskPropertyValue.setValue(value);
		taskPropertyValue.setProperty(property);
		taskPropertyValue.setTaskTemplate(taskTemplate);
		persistAndFlush(taskPropertyValue);
		return taskPropertyValue;
	}

	public static TaskPropertyValue createTaskPropertyValue(String value, String property, TaskTemplate taskTemplate) {
		return createTaskPropertyValue(value, createTaskProperty(property), taskTemplate);
	}

	public static void removeAllTaskRelatedEntities() {
		new TaskPropertyValueDAO().removeAll();
		new TaskPropertyDAO().removeAll();
		new DKSMappingDAO().removeAll();
		new TaskTemplateDAO().removeAll();
	}

	public static DKSMapping createDKSMapping(TaskTemplate taskTemplate, String dksNode) {
		DKSMapping dksMapping = new DKSMapping();
		dksMapping.setTaskTemplate(taskTemplate);
		dksMapping.setDksNode(dksNode);
		persistAndFlush(dksMapping);
		return dksMapping;
	}
}
