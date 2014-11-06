package logics;

import models.AbstractEntity;

/**
 * @param <E> Entity of this Logic
 * @param <C> Create form
 * @param <U> Update form
 */
public interface CRUDLogicInterface<E extends AbstractEntity, C, U> {

	E create(C createForm);

	E update(E entity, U updateForm);

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	String delete(E entity);
}
