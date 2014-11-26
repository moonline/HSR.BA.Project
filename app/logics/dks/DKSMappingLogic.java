package logics.dks;

import daos.dks.DKSMappingDAO;
import logics.CRUDLogicInterface;
import models.dks.DKSMapping;

public class DKSMappingLogic implements CRUDLogicInterface<DKSMapping> {

	private final DKSMappingDAO DKS_MAPPING_DAO;

	public DKSMappingLogic(DKSMappingDAO dksMappingDao) {
		DKS_MAPPING_DAO = dksMappingDao;
	}

	@Override
	public DKSMapping create(DKSMapping postedEntity) {
		return update(new DKSMapping(), postedEntity);
	}

	@Override
	public DKSMapping update(DKSMapping persistedEntity, DKSMapping postedEntity) {
		persistedEntity.setDksNode(postedEntity.getDksNode());
		persistedEntity.setTaskTemplate(postedEntity.getTaskTemplate());
		DKS_MAPPING_DAO.persist(persistedEntity);
		return persistedEntity;
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Override
	public String delete(DKSMapping entity) {
		DKS_MAPPING_DAO.remove(entity);
		return null;
	}

}
