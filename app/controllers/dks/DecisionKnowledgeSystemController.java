package controllers.dks;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.dks.DecisionKnowledgeSystemDAO;
import logics.dks.DecisionKnowledgeSystemLogic;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import models.dks.DecisionKnowledgeSystem;
import org.jetbrains.annotations.NotNull;
import play.db.jpa.Transactional;
import play.libs.F;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;
import static logics.docs.QueryResponses.Response;

public class DecisionKnowledgeSystemController extends AbstractCRUDController {

	public static final Status NOT_IMPLEMENTED_YET = internalServerError("This is not implemented yet, it is a known limitation of this version.");
	private final DecisionKnowledgeSystemLogic DKS_LOGIC;
	private final DecisionKnowledgeSystemDAO DKS_DAO;

	public DecisionKnowledgeSystemController(DecisionKnowledgeSystemLogic dksLogic, DecisionKnowledgeSystemDAO dksDao) {
		DKS_LOGIC = dksLogic;
		DKS_DAO = dksDao;
	}

	@Transactional
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "url", isId = true, description = "The full URL of the remote server to GET from.")
	})
	@QueryDescription("Redirects a request to a remote server using GET to avoid restrictions with Cross Origin Requests.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If there is an error during preparation of the request for the remote server."),
			@Response(status = 0, description = "The return value from the remote server is returned.")
	})
	@QueryExamples({
			@Example(id = "http://headers.jsontest.com/", parameters = {}),
			@Example(id = "hatetepe?__no-valid-url", parameters = {})
	})
	public F.Promise<Result> getFromDKS(@NotNull String url) {
		//noinspection RedundantCast
		return F.Promise.promise(() ->
						DKS_LOGIC.getFromDKS(url)
		).map(wsResponse ->
						(Result) status(wsResponse.getStatus(), wsResponse.asJson())
		).recoverWith(throwable ->
				F.Promise.pure(badRequest("Could not load " + url)));
	}

	@NotNull
	@Override
	protected String getEntityName() {
		return "DecisionKnowledgeSystem";
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "name", description = "the new name of the new DKS"),
			@Parameter(name = "url", description = "the URL where the DKS is")
	})
	@QueryDescription("Stores a new DKS (Decision Knowledge System).")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the DKS could not be stored."),
			@Response(status = OK, description = "If the DKS was stored. It is also returned in Json form.")
	})
	@QueryExamples({
			@Example(parameters = {"The DKS", ""}),
			@Example(parameters = {"The DKS", "http://the-dks.ch"})
	})
	public Result create() {
		return NOT_IMPLEMENTED_YET;
//		return create(DKS_LOGIC, DecisionKnowledgeSystem.class);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns one DKS (Decision Knowledge System).")
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_DKS_1000000000000000071", parameters = {})
	})
	public Result read(long id) {
		return read(DKS_DAO, id);
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns all DKSs (Decision Knowledge Systems).")
	public Result readAll() {
		return readAll(DKS_DAO);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "id", isId = true, format = Long.class, description = "The id of the mapping to update"),
			@Parameter(name = "name", description = "the new name of the new DKS to update"),
			@Parameter(name = "url", description = "the URL where the DKS is")
	})
	@QueryDescription("Updates a DKS (Decision Knowledge System).")
	@QueryExamples({
			@Example(id = "9999", parameters = {"Example DKS", "http://a-dks.com"}),
			@Example(id = "REFERENCE_DKS_1000000000000000073", parameters = {"Example DKS", "http://an-example-dks.com"}),
			@Example(id = "REFERENCE_DKS_1000000000000000074", parameters = {"Example DKS", ""})
	})
	public Result update(long id) {
		return update(DKS_DAO, DKS_LOGIC, DecisionKnowledgeSystem.class, id);
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryDescription("Deletes a DKS (Decision Knowledge System).")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If the DKS to delete could not be found."),
			@Response(status = NO_CONTENT, description = "If the DKS was deleted.")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_DKS_1000000000000000075", isDataCacheable = false, parameters = {})
	})
	public Result delete(long id) {
		return NOT_IMPLEMENTED_YET;
//		return delete(DKS_DAO, DKS_LOGIC, id);
	}

}
