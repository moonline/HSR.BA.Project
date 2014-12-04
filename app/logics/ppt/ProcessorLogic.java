package logics.ppt;

import daos.ppt.ProcessorDAO;
import logics.CRUDLogicInterface;
import models.ppt.Processor;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class ProcessorLogic implements CRUDLogicInterface<Processor> {
	private final ProcessorDAO PROCESSOR_DAO;

	public ProcessorLogic(ProcessorDAO processorDAO) {
		PROCESSOR_DAO = processorDAO;
	}

	@NotNull
	@Override
	public Processor create(@NotNull Processor postedEntity) {
		return update(new Processor(), postedEntity);
	}

	@NotNull
	@Override
	public Processor update(@NotNull Processor persistedEntity, @NotNull Processor postedEntity) {
		persistedEntity.setName(postedEntity.getName());
		persistedEntity.setProject(postedEntity.getProject());
		persistedEntity.setCode(postedEntity.getCode());
		PROCESSOR_DAO.persist(persistedEntity);
		return persistedEntity;
	}

	@Nullable
	@Override
	public String delete(Processor entity) {
		PROCESSOR_DAO.remove(entity);
		return null;
	}

}
