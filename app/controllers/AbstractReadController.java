package controllers;

import daos.AbstractDAO;
import logics.docs.DocumentationLogic;
import logics.docs.QueryExamples;
import logics.docs.QueryParameters;
import logics.docs.QueryResponses;
import models.AbstractEntity;
import org.jetbrains.annotations.NotNull;
import play.mvc.Result;

public abstract class AbstractReadController extends AbstractController {

	public AbstractReadController(DocumentationLogic documentationLogic) {
		super(documentationLogic);
	}

	@NotNull
	protected abstract String getEntityName();

	@QueryParameters({@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the entity to get")})
	@QueryResponses({
			@QueryResponses.Response(status = NOT_FOUND, description = "If no entity with the given ID exists."),
			@QueryResponses.Response(status = OK, description = "If it's found, it's returned.")
	})
	public abstract Result read(long id);

	@NotNull
	protected <E extends AbstractEntity> Result read(@NotNull AbstractDAO<E> dao, long id) {
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

	@NotNull
	protected Result readAll(@NotNull AbstractDAO<? extends AbstractEntity> dao) {
		return ok(jsonify(dao.readAll()));
	}

	@NotNull
	protected Result notFound(long id) {
		return notFound(jsonify("Could not find " + getEntityName() + " with id " + id + "."));
	}
}
