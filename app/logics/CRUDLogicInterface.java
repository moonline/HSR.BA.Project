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

	boolean delete(E entity);
}
