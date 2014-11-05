package controllers;

import play.libs.Json;
import play.mvc.Controller;

import java.util.Collection;

public abstract class AbstractController extends Controller {
	protected com.fasterxml.jackson.databind.JsonNode jsonify(Object object) {
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
}
