package logics.ppt;

import daos.ppt.ProcessorDAO;
import logics.CRUDLogicInterface;
import models.ppt.Processor;
import models.user.Project;
import play.data.validation.Constraints;

public class ProcessorLogic implements CRUDLogicInterface<Processor, ProcessorLogic.ProcessorForm, ProcessorLogic.ProcessorForm> {
	private final ProcessorDAO PROCESSOR_DAO;

	public ProcessorLogic(ProcessorDAO processorDAO) {
		PROCESSOR_DAO = processorDAO;
	}

	@Override
	public Processor create(ProcessorForm createForm) {
		return update(new Processor(), createForm);
	}

	@Override
	public Processor update(Processor entity, ProcessorForm updateForm) {
		entity.setName(updateForm.name);
		entity.setProject(updateForm.project);
		entity.setCode(updateForm.code);
		PROCESSOR_DAO.persist(entity);
		return entity;
	}

	@Override
	public String delete(Processor entity) {
		PROCESSOR_DAO.remove(entity);
		return null;
	}

	public static class ProcessorForm {
		@Constraints.Required
		public String name;
		@Constraints.Required
		public Project project;
		@Constraints.Required
		public String code;
	}
}
