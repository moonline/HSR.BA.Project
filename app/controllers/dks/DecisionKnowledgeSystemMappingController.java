package controllers.dks;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.dks.DKSMappingDAO;
import logics.dks.DKSMappingLogic;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
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
			@Example(parameters = {"REFERENCE_TASKTEMPLATE_33", "80"}),
			@Example(parameters = {"9999", "87"})
	})
	public Result create() {
		return create(DKS_MAPPING_LOGIC, DKSMappingLogic.DKSMappingForm.class);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Reads a Mapping for a DKS Node and a Task Template.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_DKSMAPPING_35", parameters = {})
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
			@Example(id = "REFERENCE_DKSMAPPING_37", parameters = {"REFERENCE_TASKTEMPLATE_33", "87"}),
			@Example(id = "9999", parameters = {"9999", "87"})
	})
	public Result update(long id) {
		return update(DKS_MAPPING_DAO, DKS_MAPPING_LOGIC, DKSMappingLogic.DKSMappingForm.class, id);
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser()
	@QueryDescription("Deletes a Mapping for a DKS Node and a Task Template.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_TASKTEMPLATE_39", parameters = {}, isDataCacheable = false)
	})
	public Result delete(long id) {
		return delete(DKS_MAPPING_DAO, DKS_MAPPING_LOGIC, id);
	}
}
