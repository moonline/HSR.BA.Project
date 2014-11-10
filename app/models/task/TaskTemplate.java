package models.task;

import com.fasterxml.jackson.annotation.JsonBackReference;
import models.dks.DKSMapping;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasktemplate")
public class TaskTemplate extends AbstractWork {

	@OneToMany(cascade = CascadeType.PERSIST, mappedBy = "taskTemplate")
	@JsonBackReference
	private List<DKSMapping> dksMappings = new ArrayList<>();

	@ManyToOne
	private TaskTemplate parent;

	private String name;

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

}
