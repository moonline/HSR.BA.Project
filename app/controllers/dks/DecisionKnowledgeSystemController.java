package controllers.dks;

import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import logics.dks.DecisionKnowledgeSystemLogic;
import play.libs.F;
import play.mvc.Controller;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;
import static logics.docs.QueryResponses.Response;

public class DecisionKnowledgeSystemController extends Controller {

	private final DecisionKnowledgeSystemLogic DKS_LOGIC;

	public DecisionKnowledgeSystemController(DecisionKnowledgeSystemLogic dksLogic) {
		DKS_LOGIC = dksLogic;
	}

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
	public F.Promise<Result> getFromDKS(String url) {
		//noinspection RedundantCast
		return F.Promise.promise(() ->
						DKS_LOGIC.getFromDKS(url)
		).map(wsResponse ->
						(Result) status(wsResponse.getStatus(), wsResponse.asJson())
		).recoverWith(throwable ->
				F.Promise.pure(badRequest("Could not load " + url)));
	}

}
