package logics.ppt;

import daos.ppt.MappingDAO;
import logics.CRUDLogicInterface;
import models.ppt.Mapping;
import models.ppt.ProjectPlanningTool;
import models.user.Project;

public class MappingLogic implements CRUDLogicInterface<Mapping, MappingLogic.MappingForm, MappingLogic.MappingForm> {


	private final MappingDAO MAPPING_DAO;

	public MappingLogic(MappingDAO mappingDao) {
		MAPPING_DAO = mappingDao;
	}

	@Override
	public Mapping create(MappingForm createForm) {
		return update(new Mapping(), createForm);
	}

	@Override
	public Mapping update(Mapping entity, MappingForm updateForm) {
		entity.setProjectPlanningTool(updateForm.projectPlanningTool);
		entity.setProject(updateForm.project);
		entity.setUrl(updateForm.url);
		entity.setRequestTemplate(updateForm.requestTemplate);
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

	public static class MappingForm {
		public ProjectPlanningTool projectPlanningTool;
		public Project project;
		public String url;
		public String requestTemplate;
	}
}
