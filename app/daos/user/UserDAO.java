package daos.user;

import daos.AbstractDAO;
import models.user.User;

public class UserDAO extends AbstractDAO<User> {

	public User readByName(String name) {
		return find("select u from User u where u.name = ?", name);
	}

}
