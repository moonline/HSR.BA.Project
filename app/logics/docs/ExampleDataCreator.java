package logics.docs;

import daos.AbstractDAO;
import daos.dks.DKSMappingDAO;
import daos.dks.DecisionKnowledgeSystemDAO;
import daos.ppt.ProcessorDAO;
import daos.ppt.ProjectPlanningToolDAO;
import daos.ppt.RequestTemplateDAO;
import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import daos.task.TaskTemplateDAO;
import daos.user.PPTAccountDAO;
import daos.user.ProjectDAO;
import daos.user.UserDAO;
import logics.user.UserLogic;
import models.dks.DKSMapping;
import models.dks.DecisionKnowledgeSystem;
import models.ppt.Processor;
import models.ppt.ProjectPlanningTool;
import models.ppt.RequestTemplate;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;
import models.task.TaskTemplate;
import models.user.PPTAccount;
import models.user.Project;
import models.user.User;
import org.apache.commons.lang3.NotImplementedException;
import org.jetbrains.annotations.NotNull;
import play.Logger;
import play.db.jpa.JPA;

import javax.persistence.EntityManager;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ExampleDataCreator {

	public final String USER_PASSWORD = "ZvGjYpyJdU";
	private final ProcessorDAO PROCESSOR_DAO;
	private final UserDAO USER_DAO;
	private final PPTAccountDAO PPT_ACCOUNT_DAO;
	private final ProjectPlanningToolDAO PROJECT_PLANNING_TOOL_DAO;
	private final TaskTemplateDAO TASK_TEMPLATE_DAO;
	private final TaskPropertyDAO TASK_PROPERTY_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;
	private final DKSMappingDAO DKS_MAPPING_DAO;
	private final RequestTemplateDAO REQUEST_TEMPLATE_DAO;
	private final ProjectDAO PROJECT_DAO;
	private final DecisionKnowledgeSystemDAO DKS_DAO;
	public String USER_NAME;
	public Long USER_ID;
	@NotNull
	private Set<String> cache = new HashSet<>();

	protected ExampleDataCreator(@NotNull UserLogic userLogic, UserDAO userDao, PPTAccountDAO pptAccountDao, ProjectPlanningToolDAO projectPlanningToolDao, TaskTemplateDAO taskTemplateDao, TaskPropertyDAO taskPropertyDao, TaskPropertyValueDAO taskPropertyValueDao, DKSMappingDAO dksMappingDao, RequestTemplateDAO requestTemplateDao, ProjectDAO projectDao, ProcessorDAO processorDAO, DecisionKnowledgeSystemDAO dksDao) {
		USER_DAO = userDao;
		PPT_ACCOUNT_DAO = pptAccountDao;
		{//create a valid user
			int i = 0;
			User user;
			String username;
			do {
				username = "user" + i;
				user = USER_DAO.readByName(username);
				if (user == null) {
					user = userLogic.createUser(new UserLogic.RegisterForm(username, USER_PASSWORD));
					JPA.em().flush();
				}
			} while (!userLogic.isPasswordCorrect(user, USER_PASSWORD));
			USER_NAME = username;
			USER_ID = user.getId();
		}
		PROJECT_PLANNING_TOOL_DAO = projectPlanningToolDao;
		TASK_TEMPLATE_DAO = taskTemplateDao;
		TASK_PROPERTY_DAO = taskPropertyDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
		DKS_MAPPING_DAO = dksMappingDao;
		REQUEST_TEMPLATE_DAO = requestTemplateDao;
		PROJECT_DAO = projectDao;
		PROCESSOR_DAO = processorDAO;
		DKS_DAO = dksDao;
	}

	public void createExampleObject(@NotNull String reference, boolean canBeCached) {
		ExampleObjectCreator objectCreator;
		String[] referenceParts = reference.split("_");
		switch (referenceParts[1]) {
			case "PPTACCOUNT":
				String pptUrl = "https://ppt.example.com";
				String pptUsername = "tbucher";
				String pptPassword = "7YqupNxN9v";
				objectCreator = new ExampleObjectCreator<>(
						PPTAccount.class,
						PPT_ACCOUNT_DAO,
						() -> {
							ProjectPlanningTool ppt = new ProjectPlanningTool();
							ppt.setName("Example Project Planning Tool");

							PPTAccount pptAccount = new PPTAccount();
							pptAccount.setPpt(ppt);
							pptAccount.setPptUrl(pptUrl);
							pptAccount.setPptUsername(pptUsername);
							pptAccount.setPptPassword(pptPassword);
							pptAccount.setUser(USER_DAO.readById(USER_ID));

							persist(ppt, pptAccount);

							return pptAccount.getId();
						},
						(existingPPTAccount) -> (
								existingPPTAccount.getPptUrl().equals(pptUrl)
										&& existingPPTAccount.getPptUsername().equals(pptUsername)
										&& existingPPTAccount.getPptPassword().equals(pptPassword)));
				break;
			case "PPT":
				String pptName = "Example Jira";
				objectCreator = new ExampleObjectCreator<>(ProjectPlanningTool.class,
						PROJECT_PLANNING_TOOL_DAO,
						() -> {
							ProjectPlanningTool ppt = new ProjectPlanningTool();
							ppt.setName(pptName);
							persist(ppt);
							return ppt.getId();
						},
						account -> account.getName().equals(pptName));
				break;
			case "TASKTEMPLATE":
				String ttName = "My example Task Template";
				objectCreator = new ExampleObjectCreator<>(TaskTemplate.class,
						TASK_TEMPLATE_DAO,
						() -> {
							TaskTemplate taskTemplate = new TaskTemplate();
							taskTemplate.setName(ttName);
							persist(taskTemplate);
							return taskTemplate.getId();
						},
						existingTaskTemplate -> existingTaskTemplate.getName().equals(ttName));
				break;
			case "TASKPROPERTY":
				String tpName = "My example Task Property";
				objectCreator = new ExampleObjectCreator<>(TaskProperty.class,
						TASK_PROPERTY_DAO,
						() -> {
							TaskProperty taskProperty = new TaskProperty();
							taskProperty.setName(tpName);
							persist(taskProperty);
							return taskProperty.getId();
						},
						existingTaskProperty -> existingTaskProperty.getName().equals(tpName));
				break;
			case "TASKPROPERTYVALUE":
				String tpValue = "My example Value";
				objectCreator = new ExampleObjectCreator<>(TaskPropertyValue.class,
						TASK_PROPERTY_VALUE_DAO,
						() -> {
							TaskProperty taskProperty = new TaskProperty();
							taskProperty.setName("My example Task Property 2");
							TaskTemplate taskTemplate = new TaskTemplate();
							taskTemplate.setName("My example Task Template 2");
							TaskPropertyValue taskPropertyValue = new TaskPropertyValue();
							taskPropertyValue.setValue(tpValue);
							taskPropertyValue.setProperty(taskProperty);
							taskPropertyValue.setTask(taskTemplate);
							persist(taskProperty, taskTemplate, taskPropertyValue);
							return taskPropertyValue.getId();
						},
						existingTaskPropertyValue -> existingTaskPropertyValue.getValue().equals(tpValue));
				break;
			case "DKSMAPPING":
				String dksNode = "87";
				objectCreator = new ExampleObjectCreator<>(DKSMapping.class,
						DKS_MAPPING_DAO,
						() -> {
							TaskTemplate taskTemplate = new TaskTemplate();
							taskTemplate.setName("My example Task Template 2");
							DKSMapping dksMapping = new DKSMapping();
							dksMapping.setDksNode(dksNode);
							dksMapping.setTaskTemplate(taskTemplate);
							persist(taskTemplate, dksMapping);
							return dksMapping.getId();
						},
						existingDKSMapping -> existingDKSMapping.getDksNode().equals(dksNode));
				break;
			case "DKS":
				String dksName = "Example DKS";
				String dksUrl = "http://an-example-dks.com";
				objectCreator = new ExampleObjectCreator<>(DecisionKnowledgeSystem.class,
						DKS_DAO,
						() -> {
							DecisionKnowledgeSystem dks = new DecisionKnowledgeSystem();
							dks.setName(dksName);
							dks.setUrl(dksUrl);
							persist(dks);
							return dks.getId();
						},
						existingDKS -> dksName.equals(existingDKS.getName()) && dksUrl.equals(existingDKS.getUrl()));
				break;
			case "DKSNODE":
				objectCreator = new ExampleObjectCreator<DKSMapping>(DKSMapping.class,
						DKS_MAPPING_DAO,
						() -> null,
						existingDKSMapping -> true) {
					@Override
					public void create(long id) {
						List<DKSMapping> existingEntities = DKS_MAPPING_DAO.readByDKSNode(id + "");
						if (existingEntities == null || existingEntities.isEmpty()) {
							TaskTemplate taskTemplate = new TaskTemplate();
							taskTemplate.setName("My example Task Template 7");
							DKSMapping dksMapping = new DKSMapping();
							dksMapping.setDksNode(id + "");
							dksMapping.setTaskTemplate(taskTemplate);
							persist(taskTemplate, dksMapping);
						} else {
							for (DKSMapping existingEntity : existingEntities) {
								if (!existingEntity.getTaskTemplate().getName().equals("My example Task Template 7")) {
									// In case this error occurs, try to take larger id numbers.
									// This is the reason for example data ids > 1000000000000000000!
									Logger.error("Could not create Example Data DKSNode with ID " + id + ", because it already exists. The problem is, this existing object is exposed to every use as example of the documentation: " + existingEntities);
								}
							}
						}
					}
				};
				break;
			case "PROCESSOR":
				String name = "Example Processor";
				String code = "function(a) { return a+'.'+a; }";
				objectCreator = new ExampleObjectCreator<>(Processor.class,
						PROCESSOR_DAO,
						() -> {
							Project project = new Project();
							project.setName("Example project");

							Processor processor = new Processor();
							processor.setName(name);
							processor.setProject(project);
							processor.setCode(code);
							persist(project, processor);
							return processor.getId();
						},
						existingProcessor -> existingProcessor.getName().equals(name) && existingProcessor.getCode().equals(code));
				break;
			case "REQUESTTEMPLATE":
				String url = "/example/endpoint";
				String requestTemplate = "{\"name\":\"${title}\"}";
				objectCreator = new ExampleObjectCreator<>(RequestTemplate.class,
						REQUEST_TEMPLATE_DAO,
						() -> {
							ProjectPlanningTool ppt = new ProjectPlanningTool();
							ppt.setName("Example PPT");
							Project project = new Project();
							project.setName("Example Project");
							RequestTemplate mapping = new RequestTemplate();
							mapping.setPpt(ppt);
							mapping.setName("My Request Template");
							mapping.setProject(project);
							mapping.setUrl(url);
							mapping.setRequestBodyTemplate(requestTemplate);
							persist(ppt, project, mapping);
							return mapping.getId();
						},
						existingRequestTemplate -> existingRequestTemplate.getUrl().equals(url) && existingRequestTemplate.getRequestBodyTemplate().equals(requestTemplate));
				break;
			case "PROJECT":
				String projectName = "The Example Project";
				objectCreator = new ExampleObjectCreator<>(Project.class,
						PROJECT_DAO,
						() -> {
							Project project = new Project();
							project.setName(projectName);
							persist(project);
							return project.getId();
						},
						existingProject -> existingProject.getName().equals(projectName));
				break;
			default:
				throw new NotImplementedException("Example-object-creation not implemented for " + referenceParts[1]);
		}
		doCreateObject(reference, canBeCached, objectCreator, Long.parseLong(referenceParts[2]));
	}

	private void persist(@NotNull Object... objectsToPersist) {
		EntityManager em = JPA.em();
		for (Object objectToPersist : objectsToPersist) {
			em.persist(objectToPersist);
		}
		em.flush();
	}

	private void doCreateObject(String reference, boolean canBeCached, @NotNull ExampleObjectCreator function, long id) {
		if (canBeCached && cache.contains(reference)) {
			return;
		}
		try {
			function.create(id);
		} catch (Throwable throwable) {
			Logger.error("Could not create example object " + reference, throwable);
		}
		if (canBeCached) {
			cache.add(reference);
		}
	}

	public static interface CreateNewObjectFunctionInterface<R> {
		@NotNull
		public R createNew();
	}

	public static interface CheckIsExistingAndExpectedFunctionInterface<A, R> {
		@NotNull
		public R check(A a);
	}

	private static class ExampleObjectCreator<T> {
		private final String className;
		private final AbstractDAO<T> dao;
		private final CreateNewObjectFunctionInterface<Long> createNewObjectFunction;
		private final CheckIsExistingAndExpectedFunctionInterface<T, Boolean> isExistingAndExpectedFunction;

		public ExampleObjectCreator(Class className, AbstractDAO<T> dao, CreateNewObjectFunctionInterface<Long> createNewObjectFunction, CheckIsExistingAndExpectedFunctionInterface<T, Boolean> isExistingAndExpectedFunction) {
			this.className = className.getSimpleName();
			this.dao = dao;
			this.createNewObjectFunction = createNewObjectFunction;
			this.isExistingAndExpectedFunction = isExistingAndExpectedFunction;
		}

		public void create(long id) {
			T existingEntity = dao.readById(id);
			if (existingEntity == null) {
				Long currentId = createNewObjectFunction.createNew();
				JPA.em().createQuery("update " + className + " p set p.id=:new where p.id=:old").setParameter("old", currentId).setParameter("new", id).executeUpdate();
			} else {
				if (!isExistingAndExpectedFunction.check(existingEntity)) {
					// In case this error occurs, try to take larger id numbers.
					// This is the reason for example data ids > 1000000000000000000!
					Logger.error("Could not create Example Data " + className + " with ID " + id + ", because it already exists. The problem is, this existing object is exposed to every use as example of the documentation: " + existingEntity);
				}
			}
		}
	}

}
