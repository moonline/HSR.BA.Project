package daos.user;

import test.AbstractTestDataCreator;
import test.AbstractDatabaseTest;
import models.user.User;
import org.junit.Test;

import static org.fest.assertions.Assertions.assertThat;

public class UserDAOTest extends AbstractDatabaseTest {

	@Test
	public void creaeteUserTest() {
		AbstractTestDataCreator.createUser("Hans", "1234");
		User user = new UserDAO().readByName("Hans");
		assertThat(user.getName()).isEqualTo("Hans");
	}

}
