package daos;

import logics.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import play.db.jpa.JPA;

import javax.persistence.Query;
import java.lang.reflect.ParameterizedType;
import java.util.List;

public abstract class AbstractDAO<T> {

	private static final Logger LOGGER = new Logger("application.database");

	@NotNull
	private final Class<T> entity;
	@NotNull
	private final String queryReadAll;
	@NotNull
	private final String queryDeleteAll;

	@SuppressWarnings({"rawtypes", "unchecked"})
	protected AbstractDAO() {
		Class<? extends AbstractDAO> clazz = getClass();
		while (!(clazz.getGenericSuperclass() instanceof ParameterizedType)) {
			//noinspection RedundantCast
			clazz = (Class<? extends AbstractDAO>) clazz.getSuperclass();
		}
		ParameterizedType parameterizedType = (ParameterizedType) clazz.getGenericSuperclass();
		entity = (Class<T>) parameterizedType.getActualTypeArguments()[0];
		queryReadAll = "select t from " + entity.getName() + " t ";
		queryDeleteAll = "delete from " + entity.getName();
	}

	public T readById(Long id) {
		LOGGER.debug("looked for " + entity.getSimpleName() + " with id " + id);
		return JPA.em().find(entity, id);
	}

	public List<T> readAll() {
		return findAll(queryReadAll);
	}

	public T persist(T entity) {
		JPA.em().persist(entity);
		LOGGER.debug("created/updated: " + entity);
		return entity;
	}

	public void remove(T entity) {
		LOGGER.debug("removed: " + entity);
		JPA.em().remove(entity);
	}

	public void flush() {
		JPA.em().flush();
	}

	public int removeAll() {
		LOGGER.debug("removed all " + entity.getSimpleName());
		return JPA.em().createQuery(queryDeleteAll).executeUpdate();
	}

	protected List<T> findAll(String query) {
		LOGGER.debug("looked for " + query);
		return getResultList(JPA.em().createQuery(query));
	}

	protected List<T> findAll(String query, @NotNull Object... params) {
		Query q = JPA.em().createQuery(query);
		for (int i = 1; i <= params.length; i++) {
			q.setParameter(i, params[i - 1]);
		}
		LOGGER.debug("looked for " + query, params);
		return getResultList(q);
	}

	@SuppressWarnings("unchecked")
	private List<T> getResultList(Query q) {
		return q.getResultList();
	}

	@Nullable
	protected T find(String query, Object... params) {
		final List<T> results = findAll(query, params);
		return results.isEmpty() ? null : results.get(0);
	}

}
