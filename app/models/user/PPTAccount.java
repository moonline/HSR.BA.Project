package models.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import models.AbstractEntity;
import models.ppt.ProjectPlanningTool;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "pptaccount")
public class PPTAccount extends AbstractEntity {

	@ManyToOne
	private ProjectPlanningTool ppt;

	private String pptUrl;

	@ManyToOne
	private User user;

	private String pptUsername;

	@JsonIgnore
	private String pptPassword;

	public ProjectPlanningTool getPpt() {
		return ppt;
	}

	public void setPpt(ProjectPlanningTool ppt) {
		this.ppt = ppt;
	}

	public String getPptUrl() {
		return pptUrl;
	}

	public void setPptUrl(String pptUrl) {
		this.pptUrl = pptUrl;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getPptUsername() {
		return pptUsername;
	}

	public void setPptUsername(String pptUsername) {
		this.pptUsername = pptUsername;
	}

	public String getPptPassword() {
		return pptPassword;
	}

	public void setPptPassword(String pptPassword) {
		this.pptPassword = pptPassword;
	}

	@Override
	public String toString() {
		return "<PPTAccount " + getId() + " " + pptUsername +
				" (ppt=" + (ppt == null ? "null" : ppt.getId()) +
				", pptUrl=" + pptUrl +
				",user=" + (user == null ? "null" : user.getId()) + ")>";
	}

}
