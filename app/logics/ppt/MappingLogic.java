package logics.ppt;

import daos.ppt.MappingDAO;
import logics.CRUDLogicInterface;
import models.ppt.Mapping;

public class MappingLogic implements CRUDLogicInterface<Mapping, Mapping, Mapping> {


	private final MappingDAO MAPPING_DAO;

	public MappingLogic(MappingDAO mappingDao) {
		MAPPING_DAO = mappingDao;
	}

	@Override
	public Mapping create(Mapping createForm) {
		return update(new Mapping(), createForm);
	}

	@Override
	public Mapping update(Mapping entity, Mapping updateForm) {
		entity.setProjectPlanningTool(updateForm.getProjectPlanningTool());
		entity.setProject(updateForm.getProject());
		entity.setUrl(updateForm.getUrl());
		entity.setRequestTemplate(updateForm.getRequestTemplate());
		MAPPING_DAO.persist(entity);
		return entity;
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
