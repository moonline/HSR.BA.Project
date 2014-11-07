package logics.dks;

import daos.dks.DKSMappingDAO;
import logics.CRUDLogicInterface;
import models.dks.DKSMapping;
import models.task.TaskTemplate;
import play.data.validation.Constraints;

public class DKSMappingLogic implements CRUDLogicInterface<DKSMapping, DKSMappingLogic.DKSMappingForm, DKSMappingLogic.DKSMappingForm> {

	private final DKSMappingDAO DKS_MAPPING_DAO;

	public DKSMappingLogic(DKSMappingDAO dksMappingDao) {
		DKS_MAPPING_DAO = dksMappingDao;
	}

	@Override
	public DKSMapping create(DKSMappingForm createForm) {
		return update(new DKSMapping(), createForm);
	}

	@Override
	public DKSMapping update(DKSMapping entity, DKSMappingForm updateForm) {
		entity.setDksNode(updateForm.dksNode);
		entity.setTaskTemplate(updateForm.taskTemplate);
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

	public static class DKSMappingForm {
		@Constraints.Required
		public String dksNode;
		@Constraints.Required
		public TaskTemplate taskTemplate;
	}

}
