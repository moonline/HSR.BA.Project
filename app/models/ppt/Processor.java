package models.ppt;

import models.AbstractEntity;
import models.user.Project;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "processor")
public class Processor extends AbstractEntity {

	private String name;
	@ManyToOne
	private Project project;
	private String code;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		this.project = project;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	@Override
	public String toString() {
		return "<Processor " + getId() + " " + name + " (project=" + (project == null ? "null" : project.getId()) + ", code=" + code + ")>";
	}

}
