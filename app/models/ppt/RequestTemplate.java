package models.ppt;

import models.AbstractEntity;
import models.user.Project;

import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "requesttemplate")
public class RequestTemplate extends AbstractEntity {

	@ManyToOne
	private ProjectPlanningTool ppt;
	@ManyToOne
	private Project project;
	private String name;
	private String url;
	@Lob
	private String requestBodyTemplate;

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

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getRequestBodyTemplate() {
		return requestBodyTemplate;
	}

	public void setRequestBodyTemplate(String requestTemplate) {
		this.requestBodyTemplate = requestTemplate;
	}

	@Override
	public String toString() {
		return "<Request Template " + getId() +
				" (ppt=" + (ppt == null ? "null" : ppt.getId()) +
				", project=" + (project == null ? "null" : project.getId()) +
				", url=" + url +
				", requestTemplate=" + requestBodyTemplate + ")>";
	}

}
