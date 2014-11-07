package models.task;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import models.AbstractEntity;
import models.dks.DKSMapping;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasktemplate")
public class TaskTemplate extends AbstractEntity {

	@OneToMany(cascade = CascadeType.PERSIST, mappedBy = "taskTemplate")
	@JsonManagedReference
	private List<DKSMapping> dksMappings = new ArrayList<>();

	@ManyToOne
	private TaskTemplate parent;

	private String name;

	@OneToMany(cascade = CascadeType.PERSIST, mappedBy = "taskTemplate")
	@JsonManagedReference
	private List<TaskPropertyValue> properties = new ArrayList<>();

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public TaskTemplate getParent() {
		return parent;
	}

	public void setParent(TaskTemplate parent) {
		this.parent = parent;
	}

	public List<DKSMapping> getDksMappings() {
		return dksMappings;
	}

	public List<TaskPropertyValue> getProperties() {
		return properties;
	}

	public void addProperty(TaskPropertyValue property) {
		this.properties.add(property);
	}

	public void removeProperty(TaskPropertyValue property) {
		this.properties.remove(property);
	}

}
