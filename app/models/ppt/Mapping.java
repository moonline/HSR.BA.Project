package models.ppt;

import models.AbstractEntity;
import models.user.Project;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "mapping")
public class Mapping extends AbstractEntity {

	@ManyToOne
	private ProjectPlanningTool projectPlanningTool;
	@ManyToOne
	private Project project;
	private String url;
	private String requestTemplate;

	public ProjectPlanningTool getProjectPlanningTool() {
		return projectPlanningTool;
	}

	public void setProjectPlanningTool(ProjectPlanningTool projectPlanningTool) {
		this.projectPlanningTool = projectPlanningTool;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getRequestTemplate() {
		return requestTemplate;
	}

	public void setRequestTemplate(String requestTemplate) {
		this.requestTemplate = requestTemplate;
	}

	@Override
	public String toString() {
		return "<Mapping " + getId() +
				" (ppt=" + (projectPlanningTool == null ? "null" : projectPlanningTool.getId()) +
				", project=" + (project == null ? "null" : project.getId()) +
				", url=" + url +
				", requestTemplate=" + requestTemplate + ")>";
	}

}
