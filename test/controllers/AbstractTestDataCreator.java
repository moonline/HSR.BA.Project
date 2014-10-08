package controllers;

import logics.user.UserLogic;
import models.user.User;
import play.db.jpa.JPA;
import play.libs.F;

public abstract class AbstractTestDataCreator {

	public static User createUserWithTransaction(final String name, final String password) throws Throwable {
		return JPA.withTransaction(new F.Function0<User>() {
			@Override
			public User apply() throws Throwable {
				return createUser(name, password);
			}
		});

	}

	public static User createUser(String name, String password) {
		return new UserLogic().createUser(name, password);
	}
}
