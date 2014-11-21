package controllers.ppt;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.ppt.MappingDAO;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import logics.ppt.MappingLogic;
import models.ppt.Mapping;
import play.db.jpa.Transactional;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;
import static logics.docs.QueryResponses.Response;

public class MappingController extends AbstractCRUDController {

	private final MappingLogic MAPPING_LOGIC;
	private final MappingDAO MAPPING_DAO;

	public MappingController(MappingLogic mappingLogic, MappingDAO mappingDao) {
		MAPPING_LOGIC = mappingLogic;
		MAPPING_DAO = mappingDao;
	}

	@Override
	protected String getEntityName() {
		return "Mapping";
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "name", description = "the new name of the new Mapping"),
			@Parameter(name = "ppt", description = "a reference (ID) to the Project Planning Tool"),
			@Parameter(name = "project", description = "a reference (ID) to the Project"),
			@Parameter(name = "url", description = "the URL to call on the Project Planning Tool (only the part after the domain and port, beginning with a \"/\")"),
			@Parameter(name = "requestTemplate", description = "the template for the request to be performed (including markup for usages of Processors)")
	})
	@QueryDescription("Stores a new mapping for sending a Task to a Project Planning Tool.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the mapping could not be stored."),
			@Response(status = OK, description = "If the mapping was stored. It is also returned in Json form.")
	})
	@QueryExamples({
			@Example(parameters = {"Mapping name", "9999", "9998", "/some/target", "{}"}),
			@Example(parameters = {"Mapping name", "REFERENCE_PPT_1000000000000000041", "REFERENCE_PROJECT_1000000000000000042", "/example/target", "{}"})
	})
	public Result create() {
		return create(MAPPING_LOGIC, Mapping.class);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns one mapping for sending a Task to a Project Planning Tool.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_PPTMAPPING_1000000000000000045", parameters = {})
	})
	public Result read(long id) {
		return read(MAPPING_DAO, id);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns all mappings for sending a Task to a Project Planning Tool.")
	public Result readAll() {
		return readAll(MAPPING_DAO);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "id", isId = true, format = Long.class, description = "The id of the mapping to update"),
			@Parameter(name = "name", description = "the new name of the mapping to update"),
			@Parameter(name = "ppt", description = "a reference (ID) to the Project Planning Tool"),
			@Parameter(name = "project", description = "a reference (ID) to the Project"),
			@Parameter(name = "url", description = "the URL to call on the Project Planning Tool (only the part after the domain and port, beginning with a \"/\")"),
			@Parameter(name = "requestTemplate", description = "the template for the request to be performed (including markup for usages of Processors)")
	})
	@QueryDescription("Updates a mapping for sending a Task to a Project Planning Tool.")
	@QueryExamples({
			@Example(id = "9999", parameters = {"Mapping name", "9999", "9998", "/asdf", "{}"}),
			@Example(id = "REFERENCE_PPTMAPPING_1000000000000000047", parameters = {"Mapping name", "9988", "9977", "/example/target", "{}"}),
			@Example(id = "REFERENCE_PPTMAPPING_1000000000000000049", parameters = {"Mapping name", "REFERENCE_PPT_1000000000000000041", "REFERENCE_PROJECT_1000000000000000042", "/example/target", "{}"})
	})
	public Result update(long id) {
		return update(MAPPING_DAO, MAPPING_LOGIC, Mapping.class, id);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryDescription("Deletes a mapping for sending a Task to a Project Planning Tool.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If the mapping to delete could not be found."),
			@Response(status = NO_CONTENT, description = "If the mapping was deleted.")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_PPTMAPPING_1000000000000000048", isDataCacheable = false, parameters = {})
	})
	public Result delete(long id) {
		return delete(MAPPING_DAO, MAPPING_LOGIC, id);
	}
}
