package logics.dks;

import daos.dks.DKSMappingDAO;
import logics.CRUDLogicInterface;
import models.dks.DKSMapping;

public class DKSMappingLogic implements CRUDLogicInterface<DKSMapping, DKSMapping, DKSMapping> {

	private final DKSMappingDAO DKS_MAPPING_DAO;

	public DKSMappingLogic(DKSMappingDAO dksMappingDao) {
		DKS_MAPPING_DAO = dksMappingDao;
	}

	@Override
	public DKSMapping create(DKSMapping createForm) {
		return update(new DKSMapping(), createForm);
	}

	@Override
	public DKSMapping update(DKSMapping entity, DKSMapping updateForm) {
		entity.setDksNode(updateForm.getDksNode());
		entity.setTaskTemplate(updateForm.getTaskTemplate());
		DKS_MAPPING_DAO.persist(entity);
		return entity;
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
