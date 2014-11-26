package controllers;

import daos.AbstractDAO;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import models.AbstractEntity;
import play.mvc.Result;

public abstract class AbstractReadController extends AbstractController {
	protected abstract String getEntityName();

	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the entity to get")})
	@QueryResponses({
			@QueryResponses.Response(status = NOT_FOUND, description = "If no entity with the given ID exists."),
			@QueryResponses.Response(status = OK, description = "If it's found, it's returned.")
	})
	public abstract Result read(long id);

	protected <E extends AbstractEntity> Result read(AbstractDAO<E> dao, long id) {
		E entity = dao.readById(id);
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

	protected Result readAll(AbstractDAO<? extends AbstractEntity> dao) {
		return ok(jsonify(dao.readAll()));
	}

	protected Result notFound(long id) {
		return notFound(jsonify("Could not find " + getEntityName() + " with id " + id + "."));
	}
}
