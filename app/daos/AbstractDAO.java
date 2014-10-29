package daos;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import play.Logger;
import play.db.jpa.JPA;

import javax.persistence.Query;
import java.lang.reflect.ParameterizedType;
import java.util.List;

public abstract class AbstractDAO<T> {

	@NotNull
	private final Class<T> entity;
	@NotNull
	private final String queryReadAll;
	@NotNull
	private final String queryDeleteAll;
	@NotNull
	private final String queryRemoveById;

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
		queryRemoveById = "delete from " + entity.getName() + " where id = ?1";
	}

	public T readById(Long id) {
		return JPA.em().find(entity, id);
	}

	public List<T> readAll() {
		return findAll(queryReadAll);
	}

	public T persist(T e) {
		JPA.em().persist(e);
		return e;
	}

	public void remove(T entity) {
		JPA.em().remove(entity);
	}

	public void removeById(long id) {
		Query query = JPA.em().createQuery(queryRemoveById);
		query.setParameter(1, id);
		query.executeUpdate();
	}

	public void flush() {
		JPA.em().flush();
	}

	public int removeAll() {
		return JPA.em().createQuery(queryDeleteAll).executeUpdate();
	}

	protected List<T> findAll(String query) {
		Logger.debug(query);
		return getResultList(JPA.em().createQuery(query));
	}

	protected List<T> findAll(String query, @NotNull Object... params) {
		Logger.debug(query);
		Query q = JPA.em().createQuery(query);
		for (int i = 1; i <= params.length; i++) {
			q.setParameter(i, params[i - 1]);
		}
		return getResultList(q);
	}

	protected List<T> findAllWithMaxResult(String query, Integer maxResult, @NotNull Object... params) {
		Logger.debug(query);
		Query q = JPA.em().createQuery(query);
		for (int i = 1; i <= params.length; i++) {
			q.setParameter(i, params[i - 1]);
		}
		q.setMaxResults(maxResult);
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
