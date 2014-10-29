package daos.user;

import daos.AbstractDAO;
import models.user.PPTAccount;
import models.user.User;

import java.util.List;

public class PPTAccountDAO extends AbstractDAO<PPTAccount> {

	public List<PPTAccount> readByUser(User user) {
		return findAll("select p from PPTAccount p where p.user=?", user);
	}

}
