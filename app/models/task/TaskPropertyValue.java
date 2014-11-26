package models.task;

import com.fasterxml.jackson.annotation.JsonBackReference;
import models.AbstractEntity;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "taskpropertyvalue")
public class TaskPropertyValue extends AbstractEntity {

	@ManyToOne
	@JoinColumn(nullable = false)
	private TaskProperty property;

	@ManyToOne
	@JoinColumn(nullable = false)
	@JsonBackReference
	private AbstractWork task;

	private String value;

	public TaskProperty getProperty() {
		return property;
	}

	public void setProperty(TaskProperty property) {
		this.property = property;
	}

	public AbstractWork getTask() {
		return task;
	}

	public void setTask(AbstractWork task) {
		this.task = task;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	@Override
	public String toString() {
		return "<TaskPropertyValue " + getId() + " " + value +
				" (property=" + (property == null ? "null" : property.getId()) +
				", task=" + (task == null ? "null" : task.getId()) + ")>";
	}

}
