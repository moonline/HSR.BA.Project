package logics.user;

import daos.user.PPTAccountDAO;
import models.user.PPTAccount;
import models.user.User;

public class PPTAccountLogic {

	public static final PPTAccountDAO PPT_ACCOUNT_DAO = new PPTAccountDAO();

	public PPTAccount getAuthentication(User user, String authentication_id) {
		if (user != null && authentication_id.matches("\\d+")) {
			PPTAccount pptAccount = PPT_ACCOUNT_DAO.readById(Long.parseLong(authentication_id));
			if (pptAccount != null && pptAccount.getUser().getId().equals(user.getId())) {
				return pptAccount;
			}
		}
		return null;
	}
}
