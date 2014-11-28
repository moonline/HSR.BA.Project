package logics.ppt;

import daos.ppt.RequestTemplateDAO;
import logics.CRUDLogicInterface;
import models.ppt.RequestTemplate;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class RequestTemplateLogic implements CRUDLogicInterface<RequestTemplate> {


	private final RequestTemplateDAO REQUEST_TEMPLATE_DAO;

	public RequestTemplateLogic(RequestTemplateDAO requestTemplateDao) {
		REQUEST_TEMPLATE_DAO = requestTemplateDao;
	}

	@NotNull
	@Override
	public RequestTemplate create(@NotNull RequestTemplate postedEntity) {
		return update(new RequestTemplate(), postedEntity);
	}

	@NotNull
	@Override
	public RequestTemplate update(@NotNull RequestTemplate persistedEntity, @NotNull RequestTemplate postedEntity) {
		persistedEntity.setPpt(postedEntity.getPpt());
		persistedEntity.setProject(postedEntity.getProject());
		persistedEntity.setName(postedEntity.getName());
		persistedEntity.setUrl(postedEntity.getUrl());
		persistedEntity.setRequestBodyTemplate(postedEntity.getRequestBodyTemplate());
		REQUEST_TEMPLATE_DAO.persist(persistedEntity);
		return persistedEntity;
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Nullable
	@Override
	public String delete(RequestTemplate entity) {
		REQUEST_TEMPLATE_DAO.remove(entity);
		return null;
	}

}
