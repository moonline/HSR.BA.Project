package logics.user;

import com.fasterxml.jackson.databind.JsonNode;
import daos.user.PPTAccountDAO;
import models.ppt.ProjectPlanningTool;
import models.user.PPTAccount;
import models.user.User;
import org.jetbrains.annotations.NotNull;
import play.data.validation.Constraints;
import play.libs.Json;
import play.mvc.Http;

public class PPTAccountLogic {

	public static final PPTAccountDAO PPT_ACCOUNT_DAO = new PPTAccountDAO();
	public static final UserLogic USER_LOGIC = new UserLogic();

	public PPTAccount getAuthentication(User user, String authentication_id) {
		if (user != null && authentication_id.matches("\\d+")) {
			PPTAccount pptAccount = PPT_ACCOUNT_DAO.readById(Long.parseLong(authentication_id));
			if (pptAccount != null && pptAccount.getUser().getId().equals(user.getId())) {
				return pptAccount;
			}
		}
		return null;
	}

	@NotNull
	public PPTAccount createPPTAccount(Http.Session session, CreatePPTAccountForm form) {
		PPTAccount account = new PPTAccount();
		account.setUser(USER_LOGIC.getLoggedInUser(session));
		return update(account, form);
	}

	public JsonNode getAllForLoggedInUser(Http.Session session) {
		User user = USER_LOGIC.getLoggedInUser(session);
		return Json.toJson(PPT_ACCOUNT_DAO.readByUser(user));
	}

	public PPTAccount getForLoggedInUser(Http.Session session, Long id) {
		User user = USER_LOGIC.getLoggedInUser(session);
		PPTAccount pptAccount = PPT_ACCOUNT_DAO.readById(id);
		return pptAccount.getUser().equals(user) ? pptAccount : null;
	}

	public PPTAccount update(PPTAccount account, UpdatePPTAccountForm updateData) {
		account.setPpt(updateData.ppt);
		account.setPptUrl(updateData.url);
		account.setPptUsername(updateData.pptUsername);
		if (updateData.pptPassword != null) {
			account.setPptPassword(updateData.pptPassword);
		}
		PPT_ACCOUNT_DAO.persist(account);
		return account;
	}

	public void delete(PPTAccount pptAccount) {
		PPT_ACCOUNT_DAO.remove(pptAccount);
	}


	public static class UpdatePPTAccountForm {
		@Constraints.Required
		public ProjectPlanningTool ppt;
		@Constraints.Required
		public String url;
		@Constraints.Required
		public String pptUsername;

		public String pptPassword;
	}

	public static class CreatePPTAccountForm extends UpdatePPTAccountForm {
		@SuppressWarnings("UnusedDeclaration") //used for form validation by Play
		public String validate() {
			if (pptPassword == null || pptPassword.equals("")) {
				return "Password must be set";
			}
			return null;
		}
	}

}
