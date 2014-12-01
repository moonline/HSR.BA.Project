package models.task;

import com.fasterxml.jackson.annotation.JsonBackReference;
import models.dks.DKSMapping;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import play.data.validation.Constraints;
import play.data.validation.ValidationError;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasktemplate")
public class TaskTemplate extends AbstractWork {

	@NotNull
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

	@SuppressWarnings("UnusedDeclaration") //is used by Json-creator
	@NotNull
	public List<DKSMapping> getDksMappings() {
		return dksMappings;
	}

	@Override
	public String toString() {
		return "<TaskTemplate " + getId() + " " + name + " (parent=" + (parent == null ? "null" : parent.getId()) + ")>";
	}

	@Nullable
	@SuppressWarnings("UnusedDeclaration") //Used by Play Framework to validate form
	public List<ValidationError> validate() {
		if (parent != null && parent.getParent() != null) {
			List<ValidationError> errorList = new ArrayList<>(1);
			errorList.add(new ValidationError("parent", "Can not create sub-sub-task (two layers)."));
			return errorList;
		}
		return null;
	}

}
