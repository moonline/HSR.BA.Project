package controllers.user;

import controllers.AuthenticationChecker;
import controllers.GuaranteeAuthenticatedUser;
import daos.user.PPTAccountDAO;
import logics.docs.QueryDescription;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import logics.user.PPTAccountLogic;
import models.user.PPTAccount;
import play.data.Form;
import play.db.jpa.Transactional;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import static logics.docs.QueryExamples.Example;
import static logics.docs.QueryParameters.Parameter;
import static logics.docs.QueryResponses.Response;

public class PPTAccountController extends Controller {

	private final PPTAccountDAO PPT_ACCOUNT_DAO;
	private final PPTAccountLogic PPT_ACCOUNT_LOGIC;
	private final AuthenticationChecker AUTHENTICATION_CHECKER;

	public PPTAccountController(PPTAccountDAO pptAccountDao, PPTAccountLogic pptAccountLogic, AuthenticationChecker authenticationChecker) {
		PPT_ACCOUNT_DAO = pptAccountDao;
		PPT_ACCOUNT_LOGIC = pptAccountLogic;
		AUTHENTICATION_CHECKER = authenticationChecker;
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "ppt", description = "a reference (ID) to the Project Planning Tool"),
			@Parameter(name = "url", description = "the URL to the Project Planning Tool"),
			@Parameter(name = "pptUsername", description = "the username for the user for the Project Planning Tool"),
			@Parameter(name = "pptPassword", description = "the password for the user for the Project Planning Tool")
	})
	@QueryDescription("Stores new login information for a Project Planning Tool on the server.")
	@QueryResponses({
			@Response(status = BAD_REQUEST, description = "If the login information could not be stored."),
			@Response(status = OK, description = "If the login information were stored. They are also returned in Json form.")
	})
	@QueryExamples({
			@Example(parameters = {"9999", "no url", "name", "1234"}),
			@Example(parameters = {"REFERENCE_PPT_5", "http.jira.example.com", "admin", "12345678"})
	})
	public Result create() {
		Form<PPTAccountLogic.CreatePPTAccountForm> form = Form.form(PPTAccountLogic.CreatePPTAccountForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(Json.toJson(PPT_ACCOUNT_LOGIC.createPPTAccount(form.get(), AUTHENTICATION_CHECKER.getLoggedInUser(ctx()))));
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns all login information (but the password) for the currently logged in user for Project Planning Tools.")
	@QueryResponses({
			@Response(status = OK, description = "If the login information were stored. They are also returned in Json form.")
	})
	@QueryExamples({
			@Example(parameters = {}, description = "assuming there is no login information stored for the user", response = @Example.Response(status = OK, content = "[]")),
			@Example(parameters = {}, description = "now with stored login information for the user", response = @Example.Response(status = OK, content = "[ { \"id\" : 103,\n" +
					"    \"ppt\" : null,\n" +
					"    \"pptUrl\" : \"http://example1.com\",\n" +
					"    \"pptUsername\" : \"admin\",\n" +
					"    \"user\" : { \"id\" : 104,\n" +
					"        \"name\" : \"User 9\"\n" +
					"      }\n" +
					"  },\n" +
					"  { \"id\" : 104,\n" +
					"    \"ppt\" : null,\n" +
					"    \"pptUrl\" : \"http://example2.com\",\n" +
					"    \"pptUsername\" : \"admin\",\n" +
					"    \"user\" : 104\n" +
					"  }\n" +
					"]"))
	})
	public Result readAll() {
		return ok(Json.toJson(PPT_ACCOUNT_DAO.readByUser(AUTHENTICATION_CHECKER.getLoggedInUser(ctx()))));
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "id", isId = true, description = "The id of the login information")
	})
	@QueryDescription("Returns one login information (but the password) for the currently logged in user for Project Planning Tools.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If the login information could not be found."),
			@Response(status = OK, description = "If the login information were stored. They are also returned in Json form.")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_PPTACCOUNT_3", parameters = {})
	})
	public Result readOne(long id) {
		PPTAccount pptAccount = PPT_ACCOUNT_LOGIC.getForUser(id, AUTHENTICATION_CHECKER.getLoggedInUser(ctx()));
		if (pptAccount == null) {
			return notFound("The account " + id + " could not be found for the logged in user.");
		}
		return ok(Json.toJson(pptAccount));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "id", isId = true, description = "The id of the login information to update"),
			@Parameter(name = "ppt", description = "a reference (ID) to the Project Planning Tool"),
			@Parameter(name = "url", description = "the URL to the Project Planning Tool"),
			@Parameter(name = "pptUsername", description = "the username for the user for the Project Planning Tool"),
			@Parameter(name = "pptPassword", description = "the password for the user for the Project Planning Tool (optional)")
	})
	@QueryDescription("Updates login information for a Project Planning Tool on the server.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If the login information to update could not be found."),
			@Response(status = BAD_REQUEST, description = "If the login information could not be updated."),
			@Response(status = OK, description = "If the login information were updated. They are also returned in Json form.")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {"1", "no url", "name", "1234"}),
			@Example(id = "REFERENCE_PPTACCOUNT_3", parameters = {"9999", "no url", "ozander", "pMuE2ekiDa"}),
			@Example(id = "REFERENCE_PPTACCOUNT_3", parameters = {"1", "http://jira.example.com", "tbucher", "7YqupNxN9v"})
	})
	public Result update(long id) {
		PPTAccount pptAccount = PPT_ACCOUNT_LOGIC.getForUser(id, AUTHENTICATION_CHECKER.getLoggedInUser(ctx()));
		if (pptAccount == null) {
			return notFound("The account " + id + " could not be found for the logged in user.");
		}
		Form<PPTAccountLogic.UpdatePPTAccountForm> form = Form.form(PPTAccountLogic.UpdatePPTAccountForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		PPT_ACCOUNT_LOGIC.update(pptAccount, form.get());
		return ok(Json.toJson(pptAccount));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "id", isId = true, description = "The id of the login information to update")
	})
	@QueryDescription("Deletes login information for a Project Planning Tool on the server.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If the login information to delete could not be found."),
			@Response(status = NO_CONTENT, description = "If the login information were deleted.")
	})
	@QueryExamples({
			@Example(id = "9999", parameters = {}),
			@Example(id = "REFERENCE_PPTACCOUNT_7", isDataCacheable = false, parameters = {})
	})
	public Result delete(long id) {
		PPTAccount pptAccount = PPT_ACCOUNT_LOGIC.getForUser(id, AUTHENTICATION_CHECKER.getLoggedInUser(ctx()));
		if (pptAccount == null) {
			return notFound("The account " + id + " could not be found for the logged in user.");
		}
		PPT_ACCOUNT_LOGIC.delete(pptAccount);
		return noContent();
	}

}
