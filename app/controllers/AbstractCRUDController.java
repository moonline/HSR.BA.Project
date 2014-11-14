package controllers;

import daos.AbstractDAO;
import logics.CRUDLogicInterface;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import models.AbstractEntity;
import play.data.Form;
import play.mvc.Result;

public abstract class AbstractCRUDController extends AbstractReadController {

	@QueryResponses({
			@QueryResponses.Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@QueryResponses.Response(status = OK, description = "The new created entity is returned.")
	})
	public abstract Result create();

	protected <E extends AbstractEntity> Result create(CRUDLogicInterface<E> logic, Class<E> createFormClass) {
		Form<E> form = Form.form(createFormClass).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(logic.create(form.get())));
	}


	@QueryResponses({
			@QueryResponses.Response(status = NOT_FOUND, description = "If no entity with the given ID exists."),
			@QueryResponses.Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@QueryResponses.Response(status = OK, description = "The new created entity is returned")
	})
	public abstract Result update(long id);

	protected <E extends AbstractEntity> Result update(AbstractDAO<E> dao, CRUDLogicInterface<E> logic, Class<E> updateFormClass, long id) {
		E entity = dao.readById(id);
		if (entity == null) {
			return notFound(id);
		}
		Form<E> form = Form.form(updateFormClass).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(logic.update(entity, form.get())));
	}

	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the entity to delete")})
	@QueryResponses({
			@QueryResponses.Response(status = NOT_FOUND, description = "If no entity with the given ID exists."),
			@QueryResponses.Response(status = CONFLICT, description = "If the entity could not be deleted."),
			@QueryResponses.Response(status = NO_CONTENT, description = "If the entity is successfully deleted.")
	})
	public abstract Result delete(long id);

	protected <E extends AbstractEntity> Result delete(AbstractDAO<E> dao, CRUDLogicInterface<E> logic, long id) {
		E entity = dao.readById(id);
		if (entity == null) {
			return notFound(id);
		}
		String deleteError = logic.delete(entity);
		if (deleteError == null) {
			return noContent();
		} else {
			return status(CONFLICT, "Could not delete the entity: " + deleteError);
		}
	}

}
