package controllers.ppt;

import controllers.GuaranteeAuthenticatedUser;
import logics.tasks.PPTTaskLogic;
import logics.user.UserLogic;
import models.user.User;
import play.data.DynamicForm;
import play.data.Form;
import play.db.jpa.Transactional;
import play.libs.F;
import play.mvc.Controller;
import play.mvc.Result;

public class ProjectPlanningToolController extends Controller {

	private static final UserLogic USER_LOGIC = new UserLogic();
	public static final PPTTaskLogic PPT_TASK_LOGIC = new PPTTaskLogic();

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	public static F.Promise<Result> sendToPPT() {
		final User user = USER_LOGIC.getLoggedInUser(session());
		DynamicForm requestData = Form.form().bindFromRequest();
		final String url_path = requestData.get("path");
		final String request_content = requestData.get("content");
		final String authentication_id = requestData.get("authentication");
		return F.Promise.promise(() ->
						PPT_TASK_LOGIC.createPPTTask(user, authentication_id, url_path, request_content)
		).map(wsResponse ->
						status(wsResponse.getStatus(), wsResponse.asJson())
		);
	}

}
