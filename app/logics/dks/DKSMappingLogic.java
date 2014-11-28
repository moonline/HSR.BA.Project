package logics.dks;

import daos.dks.DKSMappingDAO;
import logics.CRUDLogicInterface;
import models.dks.DKSMapping;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class DKSMappingLogic implements CRUDLogicInterface<DKSMapping> {

	private final DKSMappingDAO DKS_MAPPING_DAO;

	public DKSMappingLogic(DKSMappingDAO dksMappingDao) {
		DKS_MAPPING_DAO = dksMappingDao;
	}

	@NotNull
	@Override
	public DKSMapping create(@NotNull DKSMapping postedEntity) {
		return update(new DKSMapping(), postedEntity);
	}

	@NotNull
	@Override
	public DKSMapping update(@NotNull DKSMapping persistedEntity, @NotNull DKSMapping postedEntity) {
		persistedEntity.setDksNode(postedEntity.getDksNode());
		persistedEntity.setTaskTemplate(postedEntity.getTaskTemplate());
		DKS_MAPPING_DAO.persist(persistedEntity);
		return persistedEntity;
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Nullable
	@Override
	public String delete(DKSMapping entity) {
		DKS_MAPPING_DAO.remove(entity);
		return null;
	}

}
