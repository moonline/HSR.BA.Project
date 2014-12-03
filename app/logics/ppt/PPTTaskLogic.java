package logics.ppt;

import com.fasterxml.jackson.databind.JsonNode;
import daos.task.TaskDAO;
import daos.task.TaskPropertyValueDAO;
import logics.Logger;
import models.task.Task;
import models.task.TaskPropertyValue;
import models.task.TaskTemplate;
import models.user.PPTAccount;
import models.user.Project;
import org.jetbrains.annotations.NotNull;
import play.data.validation.Constraints;
import play.libs.Json;
import play.libs.ws.WS;
import play.libs.ws.WSResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.util.concurrent.TimeUnit.SECONDS;

public class PPTTaskLogic {

	private static final Logger LOGGER = new Logger("application.ppttask");

	private final TaskDAO TASK_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;

	public PPTTaskLogic(TaskDAO taskDao, TaskPropertyValueDAO taskPropertyValueDao) {
		TASK_DAO = taskDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
	}

	/**
	 * @param form    All data needed for creating a Task
	 * @param account The PPT-Account to create the task for (cannot use the one from the form, as the password probably is not passed there).
	 * @return The created Task including the response from the remote server
	 */
	@NotNull
	public Task createPPTTask(@NotNull CreatePPTTaskForm form, @NotNull PPTAccount account) {
		String url = account.getPptUrl() + form.path;
		LOGGER.debug("Performing request: curl --header 'Content-Type: application/json' --user '" + account.getPptUsername() + ":********' --header 'Content-Type: application/json;charset=UTF-8' --data-binary '" + Json.stringify(form.content) + "' " + url);
		WSResponse wsResponse = WS.url(url)
				.setHeader("Content-Type", "application/json")
				.setAuth(account.getPptUsername(), account.getPptPassword())
				.post(form.content)
				.get(30, SECONDS);
		return createTaskForRequest(form, url, wsResponse);
	}

	@NotNull
	private Task createTaskForRequest(@NotNull CreatePPTTaskForm form, String url, @NotNull WSResponse wsResponse) {
		Task task = new Task();
		task.setCreatedFrom(form.taskTemplate);
		task.setProject(form.project);
		task.setFinalRequestContent(form.content);
		task.setFinalRequestUrl(url);
		task.setFinalResponseStatus(wsResponse.getStatus());
		String responseContentType = wsResponse.getHeader("Content-Type");
		if (responseContentType != null && responseContentType.startsWith("application/json")) {
			task.setFinalResponseContent(wsResponse.asJson());
		} else {
			Map<String, String> responseContent = new HashMap<>();
			responseContent.put("content", wsResponse.getBody());
			responseContent.put("type", responseContentType);
			task.setFinalResponseContent(Json.toJson(responseContent));
		}
		TASK_DAO.persist(task);
		for (TaskPropertyValue taskProperty : form.taskProperties) {
			TaskPropertyValue newTaskProperty = new TaskPropertyValue();
			newTaskProperty.setProperty(taskProperty.getProperty());
			newTaskProperty.setValue(taskProperty.getValue());
			newTaskProperty.setTask(task);
			task.addProperty(newTaskProperty);
			TASK_PROPERTY_VALUE_DAO.persist(newTaskProperty);
		}
		TASK_PROPERTY_VALUE_DAO.flush();
		return task;
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
		public List<TaskPropertyValue> taskProperties = new ArrayList<>(0);

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
