package models.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import models.ppt.ProjectPlanningTool;

import javax.persistence.*;

@Entity
@Table(name = "pptaccount")
public class PPTAccount {

	@SuppressWarnings("UnusedDeclaration") //generated by hibernate
	@Id
	@SequenceGenerator(name = "pptaccount_seq", sequenceName = "pptaccount_seq")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pptaccount_seq")
	private Long id;

	@ManyToOne
	private ProjectPlanningTool ppt;

	private String pptUrl;

	@ManyToOne
	private User user;

	private String pptUsername;

	@JsonIgnore
	private String pptPassword;

	public Long getId() {
		return id;
	}

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
}
