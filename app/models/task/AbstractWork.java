package models.task;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import models.AbstractEntity;
import org.jetbrains.annotations.NotNull;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class AbstractWork extends AbstractEntity {

	@NotNull
	@OneToMany(cascade = CascadeType.PERSIST, mappedBy = "task", fetch = FetchType.EAGER)
	@JsonManagedReference
	private List<TaskPropertyValue> properties = new ArrayList<>();

	@NotNull
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
