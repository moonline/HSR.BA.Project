package logics.user;

import daos.user.UserDAO;
import models.user.User;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
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

	/**
	 * @return null if the password is valid, an error message otherwise
	 */
	@Nullable
	private static String validatePassword(@Nullable String password1, @Nullable String password2) {
		if (password1 == null || password2 == null) {
			return "Missing new password";
		} else if (!password1.equals(password2)) {
			return "The two passwords do not match";
		}
		return null;
	}

	@Nullable
	public User readUser(String name, @NotNull String password) {
		User user = USER_DAO.readByName(name);
		if (!isPasswordCorrect(user, password)) {
			user = null;
		}
		return user;
	}

	public boolean changePassword(@NotNull User user, @NotNull ChangePasswordForm form) {
		if (!isPasswordCorrect(user, form.oldPassword)) {
			return false;
		} else {
			user.setPasswordHash(calculatePasswordHash(user, form.newPassword));
			return true;
		}
	}

	@NotNull
	public User createUser(@NotNull RegisterForm form) {
		User user = new User();
		user.setName(form.name);
		user.initSalt(SECURE_RANDOM);
		user.setPasswordHash(calculatePasswordHash(user, form.password));
		USER_DAO.persist(user);
		return user;
	}

	public boolean isPasswordCorrect(@Nullable User user, @NotNull String password) {
		return user != null && Arrays.equals(user.getPasswordHash(), calculatePasswordHash(user, password));
	}

	private byte[] calculatePasswordHash(@NotNull User user, @NotNull String password) {
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

		@Nullable
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

		@Nullable
		@SuppressWarnings("UnusedDeclaration") //Used by play for validation
		public String validate() {
			return validatePassword(newPassword, newPasswordRepeat);
		}
	}

}
