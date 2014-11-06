package controllers;

import daos.AbstractDAO;
import logics.CRUDLogicInterface;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import models.AbstractEntity;
import play.data.Form;
import play.mvc.Result;

public abstract class AbstractCRUDController extends AbstractController {

	protected abstract String getEntityName();

	@QueryResponses({
			@QueryResponses.Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@QueryResponses.Response(status = OK, description = "The new created entity is returned.")
	})
	public abstract Result create();

	protected <T> Result create(CRUDLogicInterface<?, T, ?> logic, Class<T> createFormClass) {
		Form<T> form = Form.form(createFormClass).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(logic.create(form.get())));
	}

	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the entity to get")})
	@QueryResponses({
			@QueryResponses.Response(status = NOT_FOUND, description = "If no entity with the given ID exists."),
			@QueryResponses.Response(status = OK, description = "If it's found, it's returned.")
	})
	public abstract Result read(long id);

	protected <T> Result read(AbstractDAO<T> dao, long id) {
		T entity = dao.readById(id);
		if (entity == null) {
			return notFound(id);
		}
		return ok(jsonify(entity));
	}

	@QueryResponses({
			@QueryResponses.Response(status = OK, description = "It's always a list returned containing all (but if there is none also none) entities.")
	})
	@QueryExamples({
			@QueryExamples.Example(parameters = {})
	})
	public abstract Result readAll();


	protected <T> Status readAll(AbstractDAO<T> dao) {
		return ok(jsonify(dao.readAll()));
	}

	@QueryResponses({
			@QueryResponses.Response(status = NOT_FOUND, description = "If no entity with the given ID exists."),
			@QueryResponses.Response(status = BAD_REQUEST, description = "If the request parameter contain errors."),
			@QueryResponses.Response(status = OK, description = "The new created entity is returned")
	})
	public abstract Result update(long id);

	protected <T extends AbstractEntity, F> Result update(AbstractDAO<T> dao, CRUDLogicInterface<T, ?, F> logic, Class<F> formClass, long id) {
		T entity = dao.readById(id);
		if (entity == null) {
			return notFound(id);
		}
		Form<F> form = Form.form(formClass).bindFromRequest();
		if (form.hasErrors()) {
			return badRequest(form.errorsAsJson());
		}
		return ok(jsonify(logic.update(entity, form.get())));
	}

	private Status notFound(long id) {
		return notFound(jsonify("Could not find " + getEntityName() + " with id " + id + "."));
	}

}
