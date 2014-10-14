package logic.user;

import com.fasterxml.jackson.databind.JsonNode;
import logics.user.UserLogic;
import models.user.User;
import org.junit.Test;
import test.AbstractDatabaseTest;
import test.AbstractTestDataCreator;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;

import static org.fest.assertions.Assertions.assertThat;

public class UserLogicTest extends AbstractDatabaseTest {

	@Test
	public void testHashAndSaltFieldsNotReturned() {
		//Setup
		User user = AbstractTestDataCreator.createUser("A", "123");
		//Test
		final JsonNode json = new UserLogic().getAsJson(user);
		//Verification
		assertThat(json.get("name").asText()).isEqualTo("A");
		assertThat(json.get("password_hash")).isNull();
		assertThat(json.get("salt")).isNull();
		assertThat(json.size()).isEqualTo(getUserObjectFieldCount() - 2); // "-2" for password_hash and salt
	}

	private int getUserObjectFieldCount() {
		final Field[] fields = User.class.getDeclaredFields();
		int size = 0;
		for (Field field : fields) {
			if (!Modifier.isFinal(field.getModifiers())) { //final-fields are not real fields for this purpose
				size++;
			}
		}
		return size;
	}

}
