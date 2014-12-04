package controllers;

import logics.docs.DocumentationLogic;
import play.db.jpa.JPA;
import play.libs.F;
import play.mvc.Action;
import play.mvc.Http;
import play.mvc.Result;

/**
 * Wraps an action in am JPA transaction.
 */
public class TransactionalAction extends Action<Transactional> {

	private final DocumentationLogic DOCUMENTATION_LOGIC;

	public TransactionalAction(DocumentationLogic documentationLogic) {
		DOCUMENTATION_LOGIC = documentationLogic;
	}

	public F.Promise<Result> call(final Http.Context ctx) throws Throwable {
		return JPA.withTransactionAsync(
				AbstractController.getPersistenceUnitForCall(DOCUMENTATION_LOGIC, ctx.request()),
				configuration.readOnly(),
				() -> {
					try {
						return delegate.call(ctx);
					} catch (RuntimeException e) {
						if (e.getMessage().startsWith("No EntityManager bound to this thread")) { //this should not happen, an EntityManager SHOULD be there!
							boolean preventEndlessLoopsStrikes = Math.random() < 0.05;
							if (!preventEndlessLoopsStrikes) {
								return call(ctx);
							}
						}
						throw e;
					}
				}
		);
	}

}
