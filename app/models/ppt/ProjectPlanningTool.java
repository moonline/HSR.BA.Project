package models.ppt;

import models.AbstractEntity;

import javax.persistence.Entity;
import javax.persistence.Table;

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

	@Override
	public String toString() {
		return "<PPT " + getId() + " " + name + ">";
	}

}
