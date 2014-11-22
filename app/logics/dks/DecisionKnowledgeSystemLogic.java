package logics.dks;

import daos.dks.DecisionKnowledgeSystemDAO;
import logics.CRUDLogicInterface;
import models.dks.DecisionKnowledgeSystem;
import org.jetbrains.annotations.NotNull;
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

	@Override
	public DecisionKnowledgeSystem create(DecisionKnowledgeSystem postedEntity) {
		return update(new DecisionKnowledgeSystem(), postedEntity);
	}

	@Override
	public DecisionKnowledgeSystem update(DecisionKnowledgeSystem persistedEntity, DecisionKnowledgeSystem postedEntity) {
		persistedEntity.setName(postedEntity.getName());
		persistedEntity.setUrl(postedEntity.getUrl());
		DKS_DAO.persist(persistedEntity);
		return persistedEntity;
	}

	/**
	 * @param entity The entity to delete
	 * @return null (if the entity could be deleted) or an error message.
	 */
	@Override
	public String delete(DecisionKnowledgeSystem entity) {
		DKS_DAO.remove(entity);
		return null;
	}
}
