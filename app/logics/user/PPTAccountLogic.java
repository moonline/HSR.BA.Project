package logics.user;

import daos.user.PPTAccountDAO;
import models.ppt.ProjectPlanningTool;
import models.user.PPTAccount;
import models.user.User;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import play.data.validation.Constraints;

public class PPTAccountLogic {

	private final PPTAccountDAO PPT_ACCOUNT_DAO;

	public PPTAccountLogic(PPTAccountDAO pptAccountDao) {
		PPT_ACCOUNT_DAO = pptAccountDao;
	}

	@Nullable
	public PPTAccount read(@Nullable User user, long accountId) {
		if (user != null) {
			PPTAccount pptAccount = PPT_ACCOUNT_DAO.readById(accountId);
			if (pptAccount != null && pptAccount.getUser().getId().equals(user.getId())) {
				return pptAccount;
			}
		}
		return null;
	}

	@NotNull
	public PPTAccount create(@NotNull CreatePPTAccountForm form, User loggedInUser) {
		PPTAccount account = new PPTAccount();
		account.setUser(loggedInUser);
		return update(account, form);
	}

	@NotNull
	public PPTAccount update(@NotNull PPTAccount account, @NotNull UpdatePPTAccountForm updateData) {
		account.setPpt(updateData.ppt);
		account.setPptUrl(updateData.pptUrl);
		account.setPptUsername(updateData.pptUsername);
		if (updateData.pptPassword != null && updateData.pptPassword.length() > 0) {
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
		public String pptUrl;
		@Constraints.Required
		public String pptUsername;

		public String pptPassword;
	}

	public static class CreatePPTAccountForm extends UpdatePPTAccountForm {
		@Nullable
		@SuppressWarnings("UnusedDeclaration") //used for form validation by Play
		public String validate() {
			if (pptPassword == null || pptPassword.equals("")) {
				return "Password must be set";
			}
			return null;
		}
	}

}
