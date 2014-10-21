package controllers.ppt;

import controllers.GuaranteeAuthenticatedUser;
import logics.tasks.PPTTaskLogic;
import play.data.Form;
import play.db.jpa.Transactional;
import play.libs.F;
import play.mvc.Controller;
import play.mvc.Result;

public class ProjectPlanningToolController extends Controller {

	public static final PPTTaskLogic PPT_TASK_LOGIC = new PPTTaskLogic();

	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser()
	public static F.Promise<Result> sendToPPT() {
		Form<PPTTaskLogic.CreatePPTTaskForm> form = Form.form(PPTTaskLogic.CreatePPTTaskForm.class).bindFromRequest();
		if (form.hasErrors()) {
			return F.Promise.promise(() -> badRequest(form.errorsAsJson()));
		}
		return F.Promise.promise(() ->
						PPT_TASK_LOGIC.createPPTTask(form.get())
		).map(wsResponse ->
						status(wsResponse.getStatus(), wsResponse.asJson())
		);
	}

}
