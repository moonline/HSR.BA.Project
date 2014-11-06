package controllers;

import logics.CRUDLogicInterface;
import logics.docs.QueryResponses;
import play.data.Form;
import play.mvc.Result;

public abstract class AbstractCRUDController extends AbstractController {

	@QueryResponses({
			@QueryResponses.Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@QueryResponses.Response(status = OK, description = "The new created item is returned.")
	})
	public abstract Result create();

	protected <T> Result create(CRUDLogicInterface<?, T, ?> logic, Class<T> createFormClass) {
		Form<T> form = Form.form(createFormClass).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(logic.create(form.get())));
	}

}
