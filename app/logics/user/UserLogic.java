package logics.user;

import daos.user.UserDAO;
import models.user.User;
import org.jetbrains.annotations.NotNull;

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

	public boolean changePassword(User user, String oldPassword, String newPassword) {
		if (!passwordCorrect(user, oldPassword)) {
			return false;
		} else {
			user.setPasswordHash(calculatePasswordHash(user, newPassword));
			return true;
		}
	}

	@NotNull
	public User createUser(String name, String password) {
		User user = new User();
		user.setName(name);
		user.initSalt(SECURE_RANDOM);
		user.setPasswordHash(calculatePasswordHash(user, password));
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
}
