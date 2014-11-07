package models.user;

import models.AbstractEntity;

import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "project")
public class Project extends AbstractEntity {

	private String name;

	public String getName() {
		return name;
	}
}
