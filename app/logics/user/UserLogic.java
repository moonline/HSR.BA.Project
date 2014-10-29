package logics.user;

import daos.user.UserDAO;
import models.user.User;
import org.jetbrains.annotations.NotNull;
import play.mvc.Http;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.logging.Logger;

public class UserLogic {

	public static final UserDAO USER_DAO = new UserDAO();
	public static final String SESSION_USER_IDENTIFIER = "user";

	public User loginUser(String name, String password, Http.Session session) {
		User user = USER_DAO.readByName(name);
		if (passwordCorrect(user, password)) {
			session.put(SESSION_USER_IDENTIFIER, user.getId() + "");
			return user;
		}
		return null;
	}

	public void logoutUser(Http.Session session) {
		session.remove(SESSION_USER_IDENTIFIER);
	}

	public User getLoggedInUser(Http.Session session) {
		String userIdString = session.get(SESSION_USER_IDENTIFIER);
		if (userIdString == null || !userIdString.matches("\\d+")) {
			return null;
		}
		Long userId = Long.valueOf(userIdString);
		return USER_DAO.readById(userId);
	}

	public boolean isUserLoggedIn(Http.Session session) {
		return getLoggedInUser(session) != null;
	}

	public boolean changePassword(User user, String old_password, String new_password) {
		if (!passwordCorrect(user, old_password)) {
			return false;
		} else {
			user.setPassword_hash(calculatePasswordHash(user, new_password));
			return true;
		}
	}

	@NotNull
	public User createUser(String name, String password) {
		User user = new User();
		user.setName(name);
		user.initSalt();
		user.setPassword_hash(calculatePasswordHash(user, password));
		USER_DAO.persist(user);
		return user;
	}

	private boolean passwordCorrect(User user, String password) {
		return Arrays.equals(user.getPassword_hash(), calculatePasswordHash(user, password));
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
