package logics.dks;

import org.jetbrains.annotations.NotNull;
import play.libs.ws.WS;
import play.libs.ws.WSResponse;

import static java.util.concurrent.TimeUnit.SECONDS;

public class DecisionKnowledgeSystemLogic {

	public WSResponse getFromDKS(@NotNull String url) {
		return WS.url(url).get().get(30, SECONDS);
	}
}
