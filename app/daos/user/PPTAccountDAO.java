package daos.user;

import daos.AbstractDAO;
import models.user.PPTAccount;
import models.user.User;
import org.jetbrains.annotations.Nullable;

import java.util.List;

public class PPTAccountDAO extends AbstractDAO<PPTAccount> {

	public List<PPTAccount> readByUser(User user) {
		return findAll("select p from PPTAccount p where p.user=?", user);
	}

	@Nullable
	public PPTAccount readByUser(@Nullable User user, Long id) {
		if (user == null) {
			return null;
		}
		PPTAccount pptAccount = readById(id);
		if (pptAccount == null || pptAccount.getUser() == null || !pptAccount.getUser().getId().equals(user.getId())) {
			return null;
		}
		return pptAccount;
	}
}
