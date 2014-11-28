package logics;

import models.AbstractEntity;
import org.jetbrains.annotations.Nullable;

/**
 * @param <E> Entity of this Logic
 */
public interface CRUDLogicInterface<E extends AbstractEntity> {

	E create(E postedEntity);

	E update(E persistedEntity, E postedEntity);

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Nullable
	String delete(E entity);
}
