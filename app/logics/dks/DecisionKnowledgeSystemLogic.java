package logics.dks;

import daos.dks.DecisionKnowledgeSystemDAO;
import logics.CRUDLogicInterface;
import models.dks.DecisionKnowledgeSystem;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import play.libs.ws.WS;
import play.libs.ws.WSResponse;

import static java.util.concurrent.TimeUnit.SECONDS;

public class DecisionKnowledgeSystemLogic implements CRUDLogicInterface<DecisionKnowledgeSystem> {

	private final DecisionKnowledgeSystemDAO DKS_DAO;

	public DecisionKnowledgeSystemLogic(DecisionKnowledgeSystemDAO dksDao) {
		DKS_DAO = dksDao;
	}

	public WSResponse getFromDKS(@NotNull String url) {
		return WS.url(url).get().get(30, SECONDS);
	}

	@NotNull
	@Override
	public DecisionKnowledgeSystem create(@NotNull DecisionKnowledgeSystem postedEntity) {
		return update(new DecisionKnowledgeSystem(), postedEntity);
	}

	@NotNull
	@Override
	public DecisionKnowledgeSystem update(@NotNull DecisionKnowledgeSystem persistedEntity, @NotNull DecisionKnowledgeSystem postedEntity) {
		persistedEntity.setName(postedEntity.getName());
		persistedEntity.setUrl(postedEntity.getUrl());
		DKS_DAO.persist(persistedEntity);
		return persistedEntity;
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Nullable
	@Override
	public String delete(DecisionKnowledgeSystem entity) {
		DKS_DAO.remove(entity);
		return null;
	}
}
