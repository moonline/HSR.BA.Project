package controllers.dks;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.dks.DKSMappingDAO;
import logics.dks.DKSMappingLogic;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import models.dks.DKSMapping;
import org.jetbrains.annotations.NotNull;
import play.db.jpa.Transactional;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;

public class DecisionKnowledgeSystemMappingController extends AbstractCRUDController {

	private final DKSMappingLogic DKS_MAPPING_LOGIC;
	private final DKSMappingDAO DKS_MAPPING_DAO;

	public DecisionKnowledgeSystemMappingController(DKSMappingLogic dksMappingLogic, DKSMappingDAO dksMappingDao) {
		DKS_MAPPING_LOGIC = dksMappingLogic;
		DKS_MAPPING_DAO = dksMappingDao;
	}

	@NotNull
	@Override
	protected String getEntityName() {
		return "Decision Knowledge System Mapping";
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@Parameter(name = "taskTemplate", description = "The Task Template to map to a DKS Node"),
			@Parameter(name = "dksNode", description = "The DKS Node to map to a Task Template")
	})
	@QueryDescription("Creates a new Mapping for a DKS Node and a Task Template.")
	@QueryExamples({
			@Example(parameters = {"REFERENCE_TASKTEMPLATE_1000000000000000033", "80"}),
			@Example(parameters = {"9999", "87"})
	})
	public Result create() {
		return create(DKS_MAPPING_LOGIC, DKSMapping.class);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads a Mapping for a DKS Node and a Task Template.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_DKSMAPPING_1000000000000000035", parameters = {})
	})
	public Result read(long id) {
		return read(DKS_MAPPING_DAO, id);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads all Mappings for DKS Nodes and Task Templates.")
	public Result readAll() {
		return readAll(DKS_MAPPING_DAO);
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryParameters({
			@Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Mapping to update"),
			@Parameter(name = "taskTemplate", description = "The Task Template to map to a DKS Node"),
			@Parameter(name = "dksNode", description = "The DKS Node to map to a Task Template")
	})
	@QueryDescription("Updates an existing Mapping for a DKS Node and a Task Template.")
	@QueryExamples({
			@Example(id = "REFERENCE_DKSMAPPING_1000000000000000037", parameters = {"REFERENCE_TASKTEMPLATE_1000000000000000033", "87"}),
			@Example(id = "9999", parameters = {"9999", "87"})
	})
	public Result update(long id) {
		return update(DKS_MAPPING_DAO, DKS_MAPPING_LOGIC, DKSMapping.class, id);
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Deletes a Mapping for a DKS Node and a Task Template.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_DKSMAPPING_1000000000000000039", parameters = {}, isDataCacheable = false)
	})
	public Result delete(long id) {
		return delete(DKS_MAPPING_DAO, DKS_MAPPING_LOGIC, id);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryParameters({@QueryParameters.Parameter(name = "dksNode", isId = true, description = "The id of the DKS Node to get the mappings for")})
	@QueryDescription("Reads all Mappings for a given DKS Node.")
	@QueryResponses({
			@QueryResponses.Response(status = OK, description = "A list of all Mappings is returned, if no mapping could be found, an empty list is returned.")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_DKSNODE_1000000000000000064", parameters = {})
	})
	public Result readByDKSNode(String dksNode) {
		return ok(jsonify(DKS_MAPPING_DAO.readByDKSNode(dksNode)));
	}

}
