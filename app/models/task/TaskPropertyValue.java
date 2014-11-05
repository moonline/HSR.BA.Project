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
	private TaskTemplate taskTemplate;

	private String value;

	public TaskProperty getProperty() {
		return property;
	}

	public void setProperty(TaskProperty property) {
		this.property = property;
	}

	public TaskTemplate getTaskTemplate() {
		return taskTemplate;
	}

	public void setTaskTemplate(TaskTemplate taskTemplate) {
		this.taskTemplate = taskTemplate;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
}
