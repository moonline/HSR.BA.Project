package logics.ppt;

import daos.ppt.MappingDAO;
import logics.CRUDLogicInterface;
import models.ppt.Mapping;

public class MappingLogic implements CRUDLogicInterface<Mapping> {


	private final MappingDAO MAPPING_DAO;

	public MappingLogic(MappingDAO mappingDao) {
		MAPPING_DAO = mappingDao;
	}

	@Override
	public Mapping create(Mapping postedEntity) {
		return update(new Mapping(), postedEntity);
	}

	@Override
	public Mapping update(Mapping persistedEntity, Mapping postedEntity) {
		persistedEntity.setPpt(postedEntity.getPpt());
		persistedEntity.setProject(postedEntity.getProject());
		persistedEntity.setUrl(postedEntity.getUrl());
		persistedEntity.setRequestTemplate(postedEntity.getRequestTemplate());
		MAPPING_DAO.persist(persistedEntity);
		return persistedEntity;
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Override
	public String delete(Mapping entity) {
		MAPPING_DAO.remove(entity);
		return null;
	}

}
