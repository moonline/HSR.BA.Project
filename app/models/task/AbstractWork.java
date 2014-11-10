package models.task;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import models.AbstractEntity;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class AbstractWork extends AbstractEntity {

	@OneToMany(cascade = CascadeType.PERSIST, mappedBy = "task", fetch = FetchType.EAGER)
	@JsonManagedReference
	private List<TaskPropertyValue> properties = new ArrayList<>();

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
