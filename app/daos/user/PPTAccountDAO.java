package daos.user;

import com.fasterxml.jackson.databind.node.ObjectNode;
import daos.AbstractDAO;
import models.user.PPTAccount;
import models.user.User;

import java.util.List;

public class PPTAccountDAO extends AbstractDAO<PPTAccount> {
	@Override
	public ObjectNode getAsJson(PPTAccount entity) {
		ObjectNode json = super.getAsJson(entity);
		json.put("user", json.get("user").get("id"));
		return json;
	}

	public List<PPTAccount> readByUser(User user) {
		return findAll("select p from PPTAccount p where p.user=?", user);
	}

}
