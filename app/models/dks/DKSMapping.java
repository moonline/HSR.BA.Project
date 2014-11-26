package models.dks;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import models.AbstractEntity;
import models.task.TaskTemplate;
import play.data.validation.Constraints;

import javax.persistence.*;

@Entity
@Table(name = "dksmapping")
public class DKSMapping extends AbstractEntity {

	@ManyToOne
	@JoinColumn(nullable = false)
	@JsonManagedReference
	@Constraints.Required
	private TaskTemplate taskTemplate;

	@Column(nullable = false)
	@Constraints.Required
	private String dksNode;

	public TaskTemplate getTaskTemplate() {
		return taskTemplate;
	}

	public void setTaskTemplate(TaskTemplate taskTemplate) {
		this.taskTemplate = taskTemplate;
	}

	public String getDksNode() {
		return dksNode;
	}

	public void setDksNode(String dksNode) {
		this.dksNode = dksNode;
	}

	@Override
	public String toString() {
		return "<DKSMapping " + getId() + " (taskTemplate=" + (taskTemplate == null ? "null" : taskTemplate.getId()) + ", dksNode=" + dksNode + ")>";
	}

}
