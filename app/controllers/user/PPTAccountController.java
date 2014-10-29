package controllers.user;

import controllers.GuaranteeAuthenticatedUser;
import docs.QueryDescription;
import docs.QueryExamples;
import docs.QueryParameters;
import docs.QueryResponses;
import logics.user.PPTAccountLogic;
import models.user.PPTAccount;
import play.data.Form;
import play.db.jpa.Transactional;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;

import static docs.QueryExamples.Example;
import static docs.QueryParameters.Parameter;
import static docs.QueryResponses.Response;

public class PPTAccountController extends Controller {

	public static final PPTAccountLogic PPT_ACCOUNT_LOGIC = new PPTAccountLogic();

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
			@Example(parameters = {"1", "http.jira.example.com", "admin", "12345678"})
	})
	public static Result create() {
		Form<PPTAccountLogic.CreatePPTAccountForm> form = Form.form(PPTAccountLogic.CreatePPTAccountForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(Json.toJson(PPT_ACCOUNT_LOGIC.createPPTAccount(ctx(), form.get())));
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns all login information (but the password) for the currently logged in user for Project Planning Tools.")
	@QueryResponses({
			@Response(status = OK, description = "If the login information were stored. They are also returned in Json form.")
	})
	@QueryExamples({
			@Example(parameters = {}, response = @Example.Response(status = OK, content = "[]")),
			@Example(parameters = {}, response = @Example.Response(status = OK, content = "[ { \"id\" : 103,\n" +
					"    \"ppt\" : null,\n" +
					"    \"pptUrl\" : \"http://example1.com\",\n" +
					"    \"ppt_username\" : \"admin\",\n" +
					"    \"user\" : { \"id\" : 104,\n" +
					"        \"name\" : \"User 9\"\n" +
					"      }\n" +
					"  },\n" +
					"  { \"id\" : 104,\n" +
					"    \"ppt\" : null,\n" +
					"    \"pptUrl\" : \"http://example2.com\",\n" +
					"    \"ppt_username\" : \"admin\",\n" +
					"    \"user\" : 104\n" +
					"  }\n" +
					"]"))
	})
	public static Result readAll() {
		return ok(PPT_ACCOUNT_LOGIC.getAllForLoggedInUser(ctx()));
	}

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "id", description = "The id of the login information")
	})
	@QueryDescription("Returns one login information (but the password) for the currently logged in user for Project Planning Tools.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If the login information could not be found."),
			@Response(status = OK, description = "If the login information were stored. They are also returned in Json form.")
	})
	@QueryExamples({
			@Example(parameters = {"9999"}),
			@Example(parameters = {"104"})
	})
	public static Result readOne(long id) {
		PPTAccount pptAccount = PPT_ACCOUNT_LOGIC.getForLoggedInUser(ctx(), id);
		if (pptAccount == null) {
			return notFound("The account " + id + " could not be found for the logged in user.");
		}
		return ok(Json.toJson(pptAccount));
	}

	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@Parameter(name = "id", description = "The id of the login information to update"),
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
			@Example(parameters = {"9999", "1", "no url", "name", "1234"}),
			@Example(parameters = {"1", "9999", "no url", "name", "1234"}),
			@Example(parameters = {"1", "1", "http://example.com", "name", "1234"})
	})
	public static Result update(long id) {
		PPTAccount pptAccount = PPT_ACCOUNT_LOGIC.getForLoggedInUser(ctx(), id);
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
			@Parameter(name = "id", description = "The id of the login information to update")
	})
	@QueryDescription("Deletes login information for a Project Planning Tool on the server.")
	@QueryResponses({
			@Response(status = NOT_FOUND, description = "If the login information to delete could not be found."),
			@Response(status = NO_CONTENT, description = "If the login information were deleted.")
	})
	@QueryExamples({
			@Example(parameters = {"9999"}),
			@Example(parameters = {"1"}, response = @Example.Response(status = NO_CONTENT, content = ""))
	})
	public static Result delete(long id) {
		PPTAccount pptAccount = PPT_ACCOUNT_LOGIC.getForLoggedInUser(ctx(), id);
		if (pptAccount == null) {
			return notFound("The account " + id + " could not be found for the logged in user.");
		}
		PPT_ACCOUNT_LOGIC.delete(pptAccount);
		return noContent();
	}

}
