package models.task;

import com.fasterxml.jackson.databind.JsonNode;
import models.user.Project;
import play.libs.Json;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "task")
public class Task extends AbstractWork {

	@ManyToOne
	private TaskTemplate createdFrom;
	@ManyToOne
	private Project project;
	private String finalRequestUrl;
	private String finalRequestContent;
	private int finalResponseStatus;
	private String finalResponseContent;

	public TaskTemplate getCreatedFrom() {
		return createdFrom;
	}

	public void setCreatedFrom(TaskTemplate createdFrom) {
		this.createdFrom = createdFrom;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public String getFinalRequestUrl() {
		return finalRequestUrl;
	}

	public void setFinalRequestUrl(String finalRequestUrl) {
		this.finalRequestUrl = finalRequestUrl;
	}

	public String getFinalRequestContent() {
		return finalRequestContent;
	}

	public void setFinalRequestContent(JsonNode finalRequestContent) {
		this.finalRequestContent = Json.stringify(finalRequestContent);
	}

	public int getFinalResponseStatus() {
		return finalResponseStatus;
	}

	public void setFinalResponseStatus(int finalResponseStatus) {
		this.finalResponseStatus = finalResponseStatus;
	}

	public JsonNode getFinalResponseContent() {
		return Json.toJson(finalResponseContent);
	}

	public void setFinalResponseContent(JsonNode finalResponseContent) {
		this.finalResponseContent = Json.stringify(finalResponseContent);
	}

	@Override
	public String toString() {
		return "<User " + getId() + " (createdFrom=" + (createdFrom == null ? "null" : createdFrom.getId()) +
				", project=" + (project == null ? "null" : project.getId()) +
				", finalRequestUrl=" + finalRequestUrl +
				", finalRequestContent=" + finalRequestContent +
				", finalResponseStatus=" + finalResponseStatus +
				", finalResponseContent=" + finalRequestContent + ")>";
	}

}
