package logics.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import daos.task.TaskDAO;
import daos.task.TaskPropertyValueDAO;
import models.task.Task;
import models.task.TaskPropertyValue;
import models.task.TaskTemplate;
import models.user.PPTAccount;
import models.user.Project;
import org.jetbrains.annotations.NotNull;
import play.data.validation.Constraints;
import play.libs.ws.WS;
import play.libs.ws.WSResponse;

import java.util.List;

import static java.util.concurrent.TimeUnit.SECONDS;

public class PPTTaskLogic {

	private final TaskDAO TASK_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public PPTTaskLogic(TaskDAO taskDao, TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_DAO = taskDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
	}

	@Deprecated
	public WSResponse createPPTTaskWithoutStoring(@NotNull CreatePPTTaskWithoutStoringForm form) {
		PPTAccount account = form.account;
		return WS.url(account.getPptUrl() + form.path)
				.setHeader("Content-Type", "application/json")
				.setAuth(account.getPptUsername(), account.getPptPassword())
				.post(form.content)
				.get(30, SECONDS);
	}

	public WSResponse createPPTTask(@NotNull CreatePPTTaskForm form) {
		PPTAccount account = form.account;
		String url = account.getPptUrl() + form.path;
		WSResponse wsResponse = WS.url(url)
				.setHeader("Content-Type", "application/json")
				.setAuth(account.getPptUsername(), account.getPptPassword())
				.post(form.content)
				.get(30, SECONDS);
		createTaskForRequest(form, url, wsResponse);
		return wsResponse;
	}

	private void createTaskForRequest(CreatePPTTaskForm form, String url, WSResponse wsResponse) {
		Task task = new Task();
		task.setCreatedFrom(form.taskTemplate);
		task.setProject(form.project);
		task.setFinalRequestContent(form.content);
		task.setFinalRequestUrl(url);
		task.setFinalResponseStatus(wsResponse.getStatus());
		task.setFinalResponseContent(wsResponse.asJson());
		TASK_DAO.persist(task);
		for (TaskPropertyValue taskProperty : form.taskProperties) {
			task.addProperty(taskProperty);
			taskProperty.setTask(task);
			TASK_PROPERTY_VALUE_DAO.persist(taskProperty);
		}
	}

	@Deprecated
	public static class CreatePPTTaskWithoutStoringForm {
		@Constraints.Required
		public PPTAccount account;
		@Constraints.Required
		public String path;
		@Constraints.Required
		public JsonNode content;

		public void setAccount(PPTAccount account) {
			this.account = account;
		}

		public void setPath(String path) {
			this.path = path;
		}

		public void setContent(JsonNode content) {
			this.content = content;
		}
	}

	public static class CreatePPTTaskForm {
		@Constraints.Required
		public TaskTemplate taskTemplate;
		@Constraints.Required
		public PPTAccount account;
		@Constraints.Required
		public String path;
		@Constraints.Required
		public JsonNode content;
		@Constraints.Required
		public Project project;
		@Constraints.Required
		public List<TaskPropertyValue> taskProperties;

		public void setTaskTemplate(TaskTemplate taskTemplate) {
			this.taskTemplate = taskTemplate;
		}

		public void setAccount(PPTAccount account) {
			this.account = account;
		}

		public void setPath(String path) {
			this.path = path;
		}

		public void setContent(JsonNode content) {
			this.content = content;
		}

		public void setProject(Project project) {
			this.project = project;
		}

		public void setTaskProperties(List<TaskPropertyValue> taskProperties) {
			this.taskProperties = taskProperties;
		}
	}

}
