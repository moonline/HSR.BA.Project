package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import logics.docs.DocumentationLogic;
import org.jetbrains.annotations.NotNull;
import play.db.jpa.JPA;
import play.libs.F;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Http;

import java.util.Collection;

public abstract class AbstractController extends Controller {

	private final DocumentationLogic DOCUMENTATION_LOGIC;

	public AbstractController(DocumentationLogic documentationLogic) {
		DOCUMENTATION_LOGIC = documentationLogic;
	}

	protected JsonNode jsonify(Object object) {
		if (object instanceof Collection) {
			object = new CollectionWrapper((Collection) object);
		}
		return Json.toJson(object);
	}

	private class CollectionWrapper {
		private final Collection items;

		public CollectionWrapper(Collection items) {
			this.items = items;
		}

		public Collection getItems() {
			return items;
		}
	}

	@NotNull
	static String getPersistenceUnitForCall(@NotNull DocumentationLogic documentationLogic, @NotNull Http.Request request) {
		if (documentationLogic.isDocumentationRequest(request)) {
			return DocumentationLogic.DOCUMENTATION_PERSISTENCE_UNIT;
		}
		return "default";
	}

	protected void withTransaction(F.Callback0 block) {
		try {
			withTransaction(() -> {
				block.invoke();
				return null;
			});
		} catch (RuntimeException runtimeException) {
			throw runtimeException;
		} catch (Throwable throwable) {
			throw new RuntimeException(throwable); // I don't expect this ever to be called, because a Block does not throw (not runtime) exceptions
		}
	}

	protected <T> T withTransaction(F.Function0<T> block) throws Throwable {
		return withTransaction(block, 5);
	}

	protected <T> T withTransaction(F.Function0<T> block, int retries) throws Throwable {
		return JPA.withTransaction(getPersistenceUnitForCall(DOCUMENTATION_LOGIC, request()), false, new F.Function0<T>() {
			@Override
			public T apply() throws Throwable {
				try {
					return block.apply();
				} catch (RuntimeException e) {
					if (e.getMessage().startsWith("No EntityManager bound to this thread") && retries > 0) {
						return withTransaction(block, retries - 1); //try again, an EntityManager SHOULD be there!
					}
					throw e;
				}
			}
		});
	}

}
