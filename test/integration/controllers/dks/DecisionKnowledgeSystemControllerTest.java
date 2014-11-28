package controllers.dks;

import controllers.AbstractControllerTest;
import daos.dks.DecisionKnowledgeSystemDAO;
import models.dks.DecisionKnowledgeSystem;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import play.db.jpa.JPA;
import play.libs.F;
import play.libs.Json;
import play.libs.ws.WS;
import play.libs.ws.WSRequestHolder;
import play.libs.ws.WSResponse;
import play.mvc.Result;
import test.AbstractTestDataCreator;

import java.util.List;

import static org.fest.assertions.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.mockito.internal.verification.VerificationModeFactory.atLeastOnce;
import static org.powermock.api.mockito.PowerMockito.*;
import static play.test.Helpers.*;


@RunWith(PowerMockRunner.class)
@PrepareForTest(WS.class)
@PowerMockIgnore({"javax.management.*", "javax.crypto.*", "javax.net.ssl.*", "org.apache.http.conn.ssl.*"})
public class DecisionKnowledgeSystemControllerTest extends AbstractControllerTest {

	private static final DecisionKnowledgeSystemDAO DKS_DAO = new DecisionKnowledgeSystemDAO();

	@Test
	public void testGetFromDKSWithGoodData() throws Throwable {
		//Setup
		String url = "http://localhost:1234/myPath";
		int resultStatus = 123;
		String resultJson = "{\"result\":\"Check!\"}";

		WSResponse response = mock(WSResponse.class);
		when(response.getStatus()).thenReturn(resultStatus);
		when(response.asJson()).thenReturn(Json.parse(resultJson));

		WSRequestHolder wsURL = spy(WS.url(url));
		when(wsURL.get()).thenReturn(F.Promise.promise(() -> response));

		spy(WS.class);
		when(WS.url(url)).thenReturn(wsURL);

		//Test
		Result result = callActionWithUser(controllers.dks.routes.ref.DecisionKnowledgeSystemController.getFromDKS(url));

		//Verification
		assertThat(status(result)).isEqualTo(resultStatus);
		assertThat(contentAsString(result)).isEqualTo(resultJson);

		verifyStatic(atLeastOnce());
		WS.url(url);
	}

	@Test
	public void testGetFromDKSWithNotRespondingTarget() throws Throwable {
		//Test
		Result result = callActionWithUser(controllers.dks.routes.ref.DecisionKnowledgeSystemController.getFromDKS("http://localhost:9876/myPath"));
		//Verification
		assertThat(status(result)).isEqualTo(BAD_REQUEST);
	}

	@Test
	public void testReadAllDKSs() throws Throwable {
		//Setup
		JPA.withTransaction(DKS_DAO::removeAll);
		DecisionKnowledgeSystem dks1 = AbstractTestDataCreator.createDKSWithTransaction("DKS1");
		DecisionKnowledgeSystem dks2 = AbstractTestDataCreator.createDKSWithTransaction("DKS2");
		//Test
		Result result = callActionWithUser(controllers.dks.routes.ref.DecisionKnowledgeSystemController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\"items\":[" +
				"	{" +
				"		\"id\" : " + dks1.getId() + ",\n" +
				"		\"name\":\"DKS1\",\n" +
				"		\"url\":\"http://dks1.com\"\n" +
				"    },{" +
				"		\"id\" : " + dks2.getId() + ",\n" +
				"		\"name\":\"DKS2\",\n" +
				"		\"url\":\"http://dks2.com\"\n" +
				"	}\n" +
				"]}"));
	}


	@Test
	public void testReadOneDKS() throws Throwable {
		//Setup
		DecisionKnowledgeSystem dks = AbstractTestDataCreator.createDKSWithTransaction("DKS");
		//Test
		Result result = callActionWithUser(controllers.dks.routes.ref.DecisionKnowledgeSystemController.read(dks.getId()));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\n" +
				"	\"id\" : " + dks.getId() + ",\n" +
				"	\"name\":\"DKS\",\n" +
				"	\"url\":\"http://dks.com\"\n" +
				"}"));
	}

	@Test
	public void testReadInexistentDKS() throws Throwable {
		//Test
		Result result = callActionWithUser(controllers.dks.routes.ref.DecisionKnowledgeSystemController.read(99999));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
	}

	@Test
	public void testUpdateDKSWorking() throws Throwable {
		//Setup
		DecisionKnowledgeSystem dks = AbstractTestDataCreator.createDKSWithTransaction("DKS");
		//Test
		Result result = callActionWithUser(controllers.dks.routes.ref.DecisionKnowledgeSystemController.update(dks.getId()), postData("name", "My DKS", "url", "http://my-url.ch"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + dks.getId() + ",\n" +
				"	\"name\":\"My DKS\",\n" +
				"	\"url\" : \"http://my-url.ch\"\n" +
				"}"));
		DecisionKnowledgeSystem dksInDB = JPA.withTransaction(() -> DKS_DAO.readById(dks.getId()));
		assertThat(dksInDB.getName()).isEqualTo("My DKS");
		assertThat(dksInDB.getUrl()).isEqualTo("http://my-url.ch");
	}

	@Ignore //known limitation of this version
	@Test
	public void testCreateDKSWorking() throws Throwable {
		//Setup
		JPA.withTransaction(DKS_DAO::removeAll);
		//Test
		Result result = callActionWithUser(controllers.dks.routes.ref.DecisionKnowledgeSystemController.create(), postData("name", "My DKS", "url", "http://url"));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		//noinspection Convert2MethodRef
		List<DecisionKnowledgeSystem> dkss = JPA.withTransaction(() -> DKS_DAO.readAll());
		assertThat(dkss).hasSize(1);
		DecisionKnowledgeSystem dks = dkss.get(0);
		assertThat(dks.getName()).isEqualTo("My DKS");
		assertThat(dks.getUrl()).isEqualTo("http://url");
		assertCheckJsonResponse(result, Json.parse("{\n" +
				"	\"id\":" + dks.getId() + ",\n" +
				"	\"name\":\"My DKS\",\n" +
				"	\"url\":\"http://url\"\n" +
				"}"));
	}

	@Ignore //known limitation of this version
	@Test
	public void testDeleteDKS() throws Throwable {
		//Setup
		Long dks = AbstractTestDataCreator.createDKSWithTransaction("Old DKS").getId();
		//Test
		Result result = callActionWithUser(controllers.dks.routes.ref.DecisionKnowledgeSystemController.delete(dks));
		//Verification
		assertThat(status(result)).isEqualTo(NO_CONTENT);
		assertThat(JPA.withTransaction(() -> DKS_DAO.readById(dks))).isNull();
	}


}
