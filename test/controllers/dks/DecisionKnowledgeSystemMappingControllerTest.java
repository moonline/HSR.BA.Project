package controllers.dks;

import controllers.AbstractControllerTest;
import daos.dks.DKSMappingDAO;
import models.dks.DKSMapping;
import models.task.TaskTemplate;
import org.junit.Test;
import play.db.jpa.JPA;
import play.libs.Json;
import play.mvc.Result;
import test.AbstractTestDataCreator;

import java.util.List;

import static org.fest.assertions.Assertions.assertThat;
import static play.mvc.Http.Status.*;
import static play.test.Helpers.status;
import static test.AbstractTestDataCreator.createDKSMapping;
import static test.AbstractTestDataCreator.createTaskTemplate;

public class DecisionKnowledgeSystemMappingControllerTest extends AbstractControllerTest {

	public static final DKSMappingDAO DKS_MAPPING_DAO = new DKSMappingDAO();

	@Test
	public void testCreateDKSMappingWorking() throws Throwable {
		//Setup
		JPA.withTransaction(AbstractTestDataCreator::removeAllTaskRelatedEntities);
		TaskTemplate taskTemplate = AbstractTestDataCreator.createTaskTemplateWithTransaction("My TT");
		//Test
		Result result = callActionWithUser(routes.ref.DecisionKnowledgeSystemMappingController.create(), postData("dksNode", "7", "taskTemplate", taskTemplate.getId() + ""));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		//noinspection Convert2MethodRef
		List<DKSMapping> mappings = JPA.withTransaction(() -> DKS_MAPPING_DAO.readAll());
		assertThat(mappings).hasSize(1);
		DKSMapping mapping = mappings.get(0);
		assertThat(mapping.getDksNode()).isEqualTo("7");
		assertThat(mapping.getTaskTemplate().getId()).isEqualTo(taskTemplate.getId());
	}

	@Test
	public void testReadAllDKSMappings() throws Throwable {
		//Setup
		DKSMapping[] dksMappings = JPA.withTransaction(() -> {
			AbstractTestDataCreator.removeAllTaskRelatedEntities();
			TaskTemplate taskTemplate = createTaskTemplate("The TT");
			return new DKSMapping[]{
					createDKSMapping(taskTemplate, "11"),
					createDKSMapping(taskTemplate, "22")};
		});
		//Test
		Result result = callActionWithUser(routes.ref.DecisionKnowledgeSystemMappingController.readAll());
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{\"items\":[ { \"id\" : " + dksMappings[0].getId() + ",\n" +
				"      \"taskTemplate\" : {" +
				"			\"id\":" + dksMappings[0].getTaskTemplate().getId() +",\n" +
				"			\"parent\":null,\n" +
				"			\"name\":\"The TT\",\n" +
				"			\"properties\":[]\n"+
				"		},\n" +
				"      \"dksNode\" : \"11\"\n" +
				"    },\n" +
				"    { \"id\" : " + dksMappings[1].getId() + ",\n" +
				"      \"taskTemplate\" : {" +
				"			\"id\":" + dksMappings[0].getTaskTemplate().getId() +",\n" +
				"			\"parent\":null,\n" +
				"			\"name\":\"The TT\",\n" +
				"			\"properties\":[]\n"+
				"		},\n" +
				"      \"dksNode\" : \"22\"\n" +
				"    }\n" +
				"  ]}"));
	}


	@Test
	public void testReadOneDKSMapping() throws Throwable {
		//Setup
		DKSMapping dksMapping = JPA.withTransaction(() -> createDKSMapping(createTaskTemplate("The TT"), "33"));
		//Test
		Result result = callActionWithUser(routes.ref.DecisionKnowledgeSystemMappingController.read(dksMapping.getId()));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + dksMapping.getId() + ",\n" +
				"  \"taskTemplate\" : {" +
				"			\"id\":" + dksMapping.getTaskTemplate().getId() +",\n" +
				"			\"parent\":null,\n" +
				"			\"name\":\"The TT\",\n" +
				"			\"properties\":[]\n"+
				"	},\n" +
				"  \"dksNode\" : \"33\"\n" +
				"}"));
	}

	@Test
	public void testReadInexistentDKSMapping() throws Throwable {
		//Test
		Result result = callActionWithUser(routes.ref.DecisionKnowledgeSystemMappingController.read(99999));
		//Verification
		assertThat(status(result)).isEqualTo(NOT_FOUND);
	}

	@Test
	public void testUpdateDKSMappingWorking() throws Throwable {
		//Setup
		DKSMapping dksMapping = JPA.withTransaction(() -> createDKSMapping(createTaskTemplate("The TT"), "44"));
		//Test
		Result result = callActionWithUser(routes.ref.DecisionKnowledgeSystemMappingController.update(dksMapping.getId()), postData("dksNode", "45", "taskTemplate", dksMapping.getTaskTemplate().getId() + ""));
		//Verification
		assertThat(status(result)).isEqualTo(OK);
		assertCheckJsonResponse(result, Json.parse("{ \"id\" : " + dksMapping.getId() + ",\n" +
				"  \"taskTemplate\" : {" +
				"			\"id\":" + dksMapping.getTaskTemplate().getId() +",\n" +
				"			\"parent\":null,\n" +
				"			\"name\":\"The TT\",\n" +
				"			\"properties\":[]\n"+
				"	},\n" +
				"  \"dksNode\" : \"45\"\n" +
				"}"));
	}

	@Test
	public void testDeleteDKSMapping() throws Throwable {
		//Setup
		Long dksMapping = JPA.withTransaction(() -> createDKSMapping(createTaskTemplate("The TT"), "44")).getId();
		//Test
		Result result = callActionWithUser(routes.ref.DecisionKnowledgeSystemMappingController.delete(dksMapping));
		//Verification
		assertThat(status(result)).isEqualTo(NO_CONTENT);
		assertThat(JPA.withTransaction(() -> DKS_MAPPING_DAO.readById(dksMapping))).isNull();
	}

}
