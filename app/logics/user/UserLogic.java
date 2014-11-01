package logics.user;

import daos.user.UserDAO;
import models.user.User;
import org.jetbrains.annotations.NotNull;
import play.data.validation.Constraints;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.logging.Logger;

public class UserLogic {

	private final UserDAO USER_DAO;
	private final SecureRandom SECURE_RANDOM;

	public UserLogic(UserDAO userDao, SecureRandom secureRandom) {
		USER_DAO = userDao;
		SECURE_RANDOM = secureRandom;
	}

	public User readUser(String name, String password) {
		User user = USER_DAO.readByName(name);
		if (!passwordCorrect(user, password)) {
			user = null;
		}
		return user;
	}

	public boolean changePassword(User user, ChangePasswordForm form) {
		if (!passwordCorrect(user, form.oldPassword)) {
			return false;
		} else {
			user.setPasswordHash(calculatePasswordHash(user, form.newPassword));
			return true;
		}
	}

	@NotNull
	public User createUser(RegisterForm form) {
		User user = new User();
		user.setName(form.name);
		user.initSalt(SECURE_RANDOM);
		user.setPasswordHash(calculatePasswordHash(user, form.password));
		USER_DAO.persist(user);
		return user;
	}

	public boolean passwordCorrect(User user, String password) {
		return user != null && Arrays.equals(user.getPasswordHash(), calculatePasswordHash(user, password));
	}

	private byte[] calculatePasswordHash(User user, String password) {
		byte[] out = password.getBytes();
		try {
			MessageDigest algorithm = MessageDigest.getInstance("SHA");
			out = algorithm.digest(out);
			byte[] salt = user.getSalt();
			for (int i = 0; i < Math.min(salt.length, out.length); i++) {
				out[i] = (byte) (out[i] ^ salt[i]);
			}
			out = algorithm.digest(out);
		} catch (NoSuchAlgorithmException e) {
			Logger.getAnonymousLogger().severe("Could not find Hash-algorithm 'SHA'!");
		}
		return out;
	}

	/**
	 * @return null if the password is valid, an error message otherwise
	 */
	private static String validatePassword(String password1, String password2) {
		if (password1 == null || password2 == null) {
			return "Missing new password";
		} else if (!password1.equals(password2)) {
			return "The two passwords do not match";
		}
		return null;
	}

	public static class LoginForm {
		@Constraints.Required
		public String name;
		@Constraints.Required
		public String password;
	}

	public static class RegisterForm extends LoginForm {
		@Constraints.Required
		public String passwordRepeat;

		@SuppressWarnings("UnusedDeclaration") //Used by play for validation
		public RegisterForm() {
		}

		public RegisterForm(String name, String password) {
			this.name = name;
			this.password = password;
		}

		@SuppressWarnings("UnusedDeclaration") //Used by play for validation
		public String validate() {
			return validatePassword(password, passwordRepeat);
		}
	}

	public static class ChangePasswordForm {
		@Constraints.Required
		public String oldPassword;
		@Constraints.Required
		public String newPassword;
		@Constraints.Required
		public String newPasswordRepeat;

		@SuppressWarnings("UnusedDeclaration") //Used by play for validation
		public String validate() {
			return validatePassword(newPassword, newPasswordRepeat);
		}
	}

}
