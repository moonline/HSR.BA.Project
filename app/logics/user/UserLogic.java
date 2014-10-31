package logics.user;

import controllers.GuaranteeAuthenticatedUser;
import daos.user.UserDAO;
import models.user.User;
import org.jetbrains.annotations.NotNull;
import play.mvc.Http;

import javax.xml.bind.DatatypeConverter;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.logging.Logger;

public class UserLogic {

	private final UserDAO USER_DAO;
	public static final String SESSION_USER_IDENTIFIER = "user";
	private final SecureRandom SECURE_RANDOM;

	public UserLogic(UserDAO userDao, SecureRandom secureRandom) {
		USER_DAO = userDao;
		SECURE_RANDOM = secureRandom;
	}

	public User loginUser(String name, String password, Http.Session session) {
		User user = USER_DAO.readByName(name);
		if (!passwordCorrect(user, password)) {
			return null;
		}
		session.put(SESSION_USER_IDENTIFIER, user.getId() + "");
		return user;
	}

	public void logoutUser(Http.Session session) {
		session.remove(SESSION_USER_IDENTIFIER);
	}

	public User getLoggedInUser(Http.Context context) {
		if (GuaranteeAuthenticatedUser.Authenticator.isBasicAuthenticationEnabled(context)) {
			return getLoggedInUserByHttpBasicAuth(context);
		} else {
			return getLoggedInUserByCookie(context);
		}
	}

	private User getLoggedInUserByCookie(Http.Context context) {
		String userIdString = context.session().get(SESSION_USER_IDENTIFIER);
		if (userIdString == null || !userIdString.matches("\\d+")) {
			return null;
		}
		Long userId = Long.valueOf(userIdString);
		return USER_DAO.readById(userId);
	}

	private User getLoggedInUserByHttpBasicAuth(Http.Context context) {
		String authHeader = context.request().getHeader("authorization");
		if (authHeader == null) {
			return null;
		}
		authHeader = authHeader.substring(6);
		String[] credentials;
		try {
			credentials = new String(DatatypeConverter.parseBase64Binary(authHeader), "UTF-8").split(":");
		} catch (IOException e) {
			Logger.getAnonymousLogger().fine("Could not decode authentication header " + authHeader);
			return null;
		}
		if (credentials.length != 2) {
			return null;
		}
		User user = USER_DAO.readByName(credentials[0]);
		if (user == null || !passwordCorrect(user, credentials[1])) {
			return null;
		}
		return user;
	}

	public boolean isUserLoggedIn(Http.Context context) {
		return getLoggedInUser(context) != null;
	}

	public boolean changePassword(User user, String old_password, String new_password) {
		if (!passwordCorrect(user, old_password)) {
			return false;
		} else {
			user.setPasswordHash(calculatePasswordHash(user, new_password));
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
