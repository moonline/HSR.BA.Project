package models.ppt;

import models.AbstractEntity;

import javax.persistence.*;

@Entity
@Table(name = "ppt")
public class ProjectPlanningTool extends AbstractEntity {

	private String name;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
