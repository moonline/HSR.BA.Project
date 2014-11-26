package logics.ppt;

import daos.ppt.ProcessorDAO;
import logics.CRUDLogicInterface;
import models.ppt.Processor;

public class ProcessorLogic implements CRUDLogicInterface<Processor> {
	private final ProcessorDAO PROCESSOR_DAO;

	public ProcessorLogic(ProcessorDAO processorDAO) {
		PROCESSOR_DAO = processorDAO;
	}

	@Override
	public Processor create(Processor postedEntity) {
		return update(new Processor(), postedEntity);
	}

	@Override
	public Processor update(Processor persistedEntity, Processor postedEntity) {
		persistedEntity.setName(postedEntity.getName());
		persistedEntity.setProject(postedEntity.getProject());
		persistedEntity.setCode(postedEntity.getCode());
		PROCESSOR_DAO.persist(persistedEntity);
		return persistedEntity;
	}

	@Override
	public String delete(Processor entity) {
		PROCESSOR_DAO.remove(entity);
		return null;
	}

}
