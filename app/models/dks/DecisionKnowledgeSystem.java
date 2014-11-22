package models.dks;

import models.AbstractEntity;
import play.data.validation.Constraints;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "dks")
public class DecisionKnowledgeSystem extends AbstractEntity {

	@Column(nullable = false)
	@Constraints.Required
	private String name;
	@Column(nullable = false)
	@Constraints.Required
	private String url;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	@Override
	public String toString() {
		return "<DecisionKnowledgeSystem " + getId() + " " + name + " (url=" + url + ")>";
	}

}
