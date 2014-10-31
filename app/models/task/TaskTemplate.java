package models.task;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "tasktemplate")
public class TaskTemplate {

	@SuppressWarnings("UnusedDeclaration") //generated by hibernate
	@Id
	@SequenceGenerator(name = "tasktemplate_seq", sequenceName = "tasktemplate_seq")
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tasktemplate_seq")
	private Long id;

	@ElementCollection
	@CollectionTable(name = "Node", joinColumns = @JoinColumn(name = "tasktemplate_id"))
	@Column(name = "dksnode")
	private List<String> dksNode;

	@ManyToOne
	private TaskTemplate parent; //todo, guarantee parent has no parent and new parent hast no children

	private String name;

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
}
