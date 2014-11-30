package controllers.ppt;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.ppt.RequestTemplateDAO;
import logics.docs.*;
import logics.ppt.RequestTemplateLogic;
import models.ppt.RequestTemplate;
import org.jetbrains.annotations.NotNull;
import controllers.Transactional;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;
import static logics.docs.QueryResponses.Response;

public class RequestTemplateController extends AbstractCRUDController {

	private final RequestTemplateLogic REQUEST_TEMPLATE_LOGIC;
	private final RequestTemplateDAO REQUEST_TEMPLATE_DAO;

	public RequestTemplateController(RequestTemplateLogic requestTemplateLogic, RequestTemplateDAO requestTemplateDao, DocumentationLogic documentationLogic) {
		super(documentationLogic);
		REQUEST_TEMPLATE_LOGIC = requestTemplateLogic;
		REQUEST_TEMPLATE_DAO = requestTemplateDao;
	}

	@NotNull
	@Override
	protected String getEntityName() {
		return "Request Template";
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "name", description = "the new name of the new Request Template"),
			@Parameter(name = "ppt", description = "a reference (ID) to the Project Planning Tool"),
			@Parameter(name = "project", description = "a reference (ID) to the Project"),
			@Parameter(name = "url", description = "the URL to call on the Project Planning Tool (only the part after the domain and port, beginning with a \"/\")"),
			@Parameter(name = "requestTemplate", description = "the template for the request to be performed (including markup for usages of Processors)")
	})
	@QueryDescription("Stores a new Request Template for sending a Task to a Project Planning Tool.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the Request Template could not be stored."),
			@Response(status = OK, description = "If the Request Template was stored. It is also returned in Json form.")
	})
	@QueryExamples({
			@Example(parameters = {"Request Template name", "9999", "9998", "/some/target", "{}"}),
			@Example(parameters = {"Request Template name", "REFERENCE_PPT_1000000000000000041", "REFERENCE_PROJECT_1000000000000000042", "/example/target", "{}"})
	})
	public Result create() {
		return create(REQUEST_TEMPLATE_LOGIC, RequestTemplate.class);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns one Request Template for sending a Task to a Project Planning Tool.")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_REQUESTTEMPLATE_1000000000000000045", parameters = {})
	})
	public Result read(long id) {
		return read(REQUEST_TEMPLATE_DAO, id);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns all Request Templates for sending a Task to a Project Planning Tool.")
	public Result readAll() {
		return readAll(REQUEST_TEMPLATE_DAO);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "id", isId = true, format = Long.class, description = "The id of the Request Template to update"),
			@Parameter(name = "name", description = "the new name of the Request Template to update"),
			@Parameter(name = "ppt", description = "a reference (ID) to the Project Planning Tool"),
			@Parameter(name = "project", description = "a reference (ID) to the Project"),
			@Parameter(name = "url", description = "the URL to call on the Project Planning Tool (only the part after the domain and port, beginning with a \"/\")"),
			@Parameter(name = "requestTemplate", description = "the template for the request to be performed (including markup for usages of Processors)")
	})
	@QueryDescription("Updates a Request Template for sending a Task to a Project Planning Tool.")
	@QueryExamples({
			@Example(id = "9999", parameters = {"Request Template name", "9999", "9998", "/asdf", "{}"}),
			@Example(id = "REFERENCE_REQUESTTEMPLATE_1000000000000000047", parameters = {"Request Template name", "9988", "9977", "/example/target", "{}"}),
			@Example(id = "REFERENCE_REQUESTTEMPLATE_1000000000000000049", parameters = {"Request Template name", "REFERENCE_PPT_1000000000000000041", "REFERENCE_PROJECT_1000000000000000042", "/example/target", "{}"})
	})
	public Result update(long id) {
		return update(REQUEST_TEMPLATE_DAO, REQUEST_TEMPLATE_LOGIC, RequestTemplate.class, id);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryDescription("Deletes a Request Template for sending a Task to a Project Planning Tool.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If the Request Template to delete could not be found."),
			@Response(status = NO_CONTENT, description = "If the Request Template was deleted.")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_REQUESTTEMPLATE_1000000000000000048", isDataCacheable = false, parameters = {})
	})
	public Result delete(long id) {
		return delete(REQUEST_TEMPLATE_DAO, REQUEST_TEMPLATE_LOGIC, id);
	}
}
