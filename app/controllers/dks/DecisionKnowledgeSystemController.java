package controllers.dks;

import docs.QueryDescription;
import docs.QueryExamples;
import docs.QueryParameters;
import docs.QueryResponses;
import logics.dks.DecisionKnowledgeSystemLogic;
import play.libs.F;
import play.mvc.Controller;
import play.mvc.Result;

import static docs.QueryExamples.Example;
import static docs.QueryParameters.Parameter;
import static docs.QueryResponses.Response;

public class DecisionKnowledgeSystemController extends Controller {

	public static final DecisionKnowledgeSystemLogic DKS_LOGIC = new DecisionKnowledgeSystemLogic();

	@QueryParameters({
			@Parameter(name = "url", description = "The full URL of the remote server to GET from.")
	})
	@QueryDescription("Redirects a request to a remote server using GET to avoid restrictions with Cross Origin Requests.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If there is an error during preparation of the request for the remote server."),
			@Response(status = 0, description = "The return value from the remote server is returned.")
	})
	@QueryExamples({
			@Example(parameters = "http://headers.jsontest.com/"),
			@Example(parameters = "hatetepe?__no-valid-url")
	})
	public static F.Promise<Result> getFromDKS(String remoteUrl) {
		return F.Promise.promise(() ->
						DKS_LOGIC.getFromDKS(remoteUrl)
		).fallbackTo(
				F.Promise.pure(null)
		).map(wsResponse -> {
					if (wsResponse == null) {
						return badRequest();
					} else {
						return status(wsResponse.getStatus(), wsResponse.asJson());
					}
				}
		);
	}

}