package logics.user;

import daos.user.PPTAccountDAO;
import models.ppt.ProjectPlanningTool;
import models.user.PPTAccount;
import models.user.User;
import org.jetbrains.annotations.NotNull;
import play.data.validation.Constraints;

public class PPTAccountLogic {

	private final PPTAccountDAO PPT_ACCOUNT_DAO;

	public PPTAccountLogic(PPTAccountDAO pptAccountDao) {
		PPT_ACCOUNT_DAO = pptAccountDao;
	}

	public PPTAccount getAuthentication(User user, String authenticationId) {
		if (user != null && authenticationId.matches("\\d+")) {
			PPTAccount pptAccount = PPT_ACCOUNT_DAO.readById(Long.parseLong(authenticationId));
			if (pptAccount != null && pptAccount.getUser().getId().equals(user.getId())) {
				return pptAccount;
			}
		}
		return null;
	}

	@NotNull
	public PPTAccount createPPTAccount(CreatePPTAccountForm form, User loggedInUser) {
		PPTAccount account = new PPTAccount();
		account.setUser(loggedInUser);
		return update(account, form);
	}

	public PPTAccount getForUser(Long id, User user) {
		PPTAccount pptAccount = PPT_ACCOUNT_DAO.readById(id);
		return (pptAccount != null && pptAccount.getUser().equals(user)) ? pptAccount : null;
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
