package models.task;

import models.AbstractEntity;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "taskproperty")
public class TaskProperty extends AbstractEntity {

	private String name;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return "<TaskProperty " + getId() + " " + name + ">";
	}

}
