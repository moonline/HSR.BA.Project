package models.task;

import com.fasterxml.jackson.annotation.JsonBackReference;
import models.dks.DKSMapping;
import play.data.validation.Constraints;

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

	@Constraints.Required
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

	@Override
	public String toString() {
		return "<TaskTemplate " + getId() + " " + name + " (parent=" + (parent == null ? "null" : parent.getId()) + ")>";
	}

	@SuppressWarnings("UnusedDeclaration") //Used by Play Framework to validate form
	public String validate() {
		if (parent != null && parent.getParent() != null) {
			return "Can not create sub-sub-task (two layers).";
		}
		return null;
	}

}
