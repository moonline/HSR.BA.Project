package daos.user;

import daos.AbstractDAO;
import models.user.User;
import org.jetbrains.annotations.Nullable;

public class UserDAO extends AbstractDAO<User> {

	@Nullable
	public User readByName(String name) {
		return find("select u from User u where u.name = ?", name);
	}

}
