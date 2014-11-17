package models.ppt;

import models.AbstractEntity;
import models.user.Project;

import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "mapping")
public class Mapping extends AbstractEntity {

	@ManyToOne
	private ProjectPlanningTool ppt;
	@ManyToOne
	private Project project;
	private String url;
	@Lob
	private String requestTemplate;

	public ProjectPlanningTool getPpt() {
		return ppt;
	}

	public void setPpt(ProjectPlanningTool ppt) {
		this.ppt = ppt;
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
				" (ppt=" + (ppt == null ? "null" : ppt.getId()) +
				", project=" + (project == null ? "null" : project.getId()) +
				", url=" + url +
				", requestTemplate=" + requestTemplate + ")>";
	}

}
