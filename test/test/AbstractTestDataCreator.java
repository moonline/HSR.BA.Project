package test;

import logics.user.UserLogic;
import models.user.PPTAccount;
import models.user.User;
import play.db.jpa.JPA;

import javax.persistence.EntityManager;

public abstract class AbstractTestDataCreator {

	public static User createUserWithTransaction(final String name, final String password) throws Throwable {
		return JPA.withTransaction(() -> createUser(name, password));

	}

	public static User createUser(String name, String password) {
		return new UserLogic().createUser(name, password);
	}

	public static PPTAccount createPPTAccountWithTransaction(User user, String pptUrl, String pptUsername, String pptPassword) {
		final PPTAccount account = new PPTAccount();
		account.setPpt_password(pptPassword);
		account.setPpt_username(pptUsername);
		account.setPptUrl(pptUrl);
		account.setUser(user);
		JPA.withTransaction(() -> {
			EntityManager em = JPA.em();
			em.persist(account);
			em.flush();
		});
		return account;
	}
}
