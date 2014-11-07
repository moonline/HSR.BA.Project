package models.task;

import models.user.Project;

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
	private String finalResponseStatus;
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

	public void setFinalRequestContent(String finalRequestContent) {
		this.finalRequestContent = finalRequestContent;
	}

	public String getFinalResponseStatus() {
		return finalResponseStatus;
	}

	public void setFinalResponseStatus(String finalResponseStatus) {
		this.finalResponseStatus = finalResponseStatus;
	}

	public String getFinalResponseContent() {
		return finalResponseContent;
	}

	public void setFinalResponseContent(String finalResponseContent) {
		this.finalResponseContent = finalResponseContent;
	}
}
