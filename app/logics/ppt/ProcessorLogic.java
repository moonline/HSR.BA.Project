package logics.ppt;

import daos.ppt.ProcessorDAO;
import logics.CRUDLogicInterface;
import models.ppt.Processor;

public class ProcessorLogic implements CRUDLogicInterface<Processor, Processor, Processor> {
	private final ProcessorDAO PROCESSOR_DAO;

	public ProcessorLogic(ProcessorDAO processorDAO) {
		PROCESSOR_DAO = processorDAO;
	}

	@Override
	public Processor create(Processor createForm) {
		return update(new Processor(), createForm);
	}

	@Override
	public Processor update(Processor entity, Processor updateForm) {
		entity.setName(updateForm.getName());
		entity.setProject(updateForm.getProject());
		entity.setCode(updateForm.getCode());
		PROCESSOR_DAO.persist(entity);
		return entity;
	}

	@Override
	public String delete(Processor entity) {
		PROCESSOR_DAO.remove(entity);
		return null;
	}

}
