package logics.docs;

import daos.AbstractDAO;
import daos.dks.DKSMappingDAO;
import daos.ppt.MappingDAO;
import daos.ppt.ProcessorDAO;
import daos.ppt.ProjectPlanningToolDAO;
import daos.task.TaskPropertyDAO;
import daos.task.TaskPropertyValueDAO;
import daos.task.TaskTemplateDAO;
import daos.user.PPTAccountDAO;
import daos.user.ProjectDAO;
import daos.user.UserDAO;
import logics.user.UserLogic;
import models.dks.DKSMapping;
import models.ppt.Mapping;
import models.ppt.Processor;
import models.ppt.ProjectPlanningTool;
import models.task.TaskProperty;
import models.task.TaskPropertyValue;
import models.task.TaskTemplate;
import models.user.PPTAccount;
import models.user.Project;
import models.user.User;
import org.apache.commons.lang3.NotImplementedException;
import play.Logger;
import play.db.jpa.JPA;
import play.libs.F;

import javax.persistence.EntityManager;
import java.util.HashSet;
import java.util.Set;

public class ExampleDataCreator {

	private final ProcessorDAO PROCESSOR_DAO;
	private final UserDAO USER_DAO;
	private final PPTAccountDAO PPT_ACCOUNT_DAO;
	private final ProjectPlanningToolDAO PROJECT_PLANNING_TOOL_DAO;
	private final TaskTemplateDAO TASK_TEMPLATE_DAO;
	private final TaskPropertyDAO TASK_PROPERTY_DAO;
	private final TaskPropertyValueDAO TASK_PROPERTY_VALUE_DAO;
	private final DKSMappingDAO DKS_MAPPING_DAO;
	private final MappingDAO MAPPING_DAO;
	private final ProjectDAO PROJECT_DAO;


	private Set<String> cache = new HashSet<>();

	public String USER_NAME;

	public final String USER_PASSWORD = "ZvGjYpyJdU";

	public Long USER_ID;

	public ExampleDataCreator(UserLogic userLogic, UserDAO userDao, PPTAccountDAO pptAccountDao, ProjectPlanningToolDAO projectPlanningToolDao, TaskTemplateDAO taskTemplateDao, TaskPropertyDAO taskPropertyDao, TaskPropertyValueDAO taskPropertyValueDao, DKSMappingDAO dksMappingDao, MappingDAO mappingDao, ProjectDAO projectDao, ProcessorDAO processorDAO) {
		USER_DAO = userDao;
		PPT_ACCOUNT_DAO = pptAccountDao;
		JPA.withTransaction(new F.Callback0() {
			@Override
			public void invoke() throws Throwable {
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
		});
		PROJECT_PLANNING_TOOL_DAO = projectPlanningToolDao;
		TASK_TEMPLATE_DAO = taskTemplateDao;
		TASK_PROPERTY_DAO = taskPropertyDao;
		TASK_PROPERTY_VALUE_DAO = taskPropertyValueDao;
		DKS_MAPPING_DAO = dksMappingDao;
		MAPPING_DAO = mappingDao;
		PROJECT_DAO = projectDao;
		PROCESSOR_DAO = processorDAO;
	}

	public void createExampleObject(String reference, boolean canBeCached) {
		ExampleObjectCreator objectCreator;
		String[] referenceParts = reference.split("_");
		switch (referenceParts[1]) {
			case "PPTACCOUNT":
				String pptUrl = "https://ppt.example.com";
				String pptUsername = "tbucher";
				String pptPassword = "7YqupNxN9v";
				objectCreator = new ExampleObjectCreator<>(
						"PPTAccount",
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
				objectCreator = new ExampleObjectCreator<>("ProjectPlanningTool",
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
				objectCreator = new ExampleObjectCreator<>("TaskTemplate",
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
				objectCreator = new ExampleObjectCreator<>("TaskProperty",
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
				objectCreator = new ExampleObjectCreator<>("TaskPropertyValue",
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
				objectCreator = new ExampleObjectCreator<>("DKSMapping",
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
			case "PROCESSOR":
				String name = "Example Processor";
				String code = "function(a) { return a+'.'+a; }";
				objectCreator = new ExampleObjectCreator<>("Processor",
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
			case "PPTMAPPING":
				String url = "/example/endpoint";
				String requestTemplate = "{\"name\":\"${title}\"}";
				objectCreator = new ExampleObjectCreator<>("Mapping",
						MAPPING_DAO,
						() -> {
							ProjectPlanningTool ppt = new ProjectPlanningTool();
							ppt.setName("Example PPT");
							Project project = new Project();
							project.setName("Example Project");
							Mapping mapping = new Mapping();
							mapping.setProjectPlanningTool(ppt);
							mapping.setProject(project);
							mapping.setUrl(url);
							mapping.setRequestTemplate(requestTemplate);
							persist(ppt, project, mapping);
							return mapping.getId();
						},
						existingPPTMapping -> existingPPTMapping.getUrl().equals(url) && existingPPTMapping.getRequestTemplate().equals(requestTemplate));
				break;
			case "PROJECT":
				String projectName = "The Example Project";
				objectCreator = new ExampleObjectCreator<>("Project",
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

	private static class ExampleObjectCreator<T> {
		private final String className;
		private final AbstractDAO<T> dao;
		private final CreateNewObjectFunctionInterface<Long> createNewObjectFunction;
		private final CheckIsExistingAndExpectedFunctionInterface<T, Boolean> isExistingAndExpectedFunction;

		public ExampleObjectCreator(String className, AbstractDAO<T> dao, CreateNewObjectFunctionInterface<Long> createNewObjectFunction, CheckIsExistingAndExpectedFunctionInterface<T, Boolean> isExistingAndExpectedFunction) {
			this.className = className;
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
					// In case this error occours, try to take larger id numbers.
					// This is the reason for example data ids > 1000000000000000000!
					Logger.error("Could not create Example Data " + className + " with ID " + id + ", because it already exists. The problem is, this existing object is exposed to every use as example of the documentation: " + existingEntity);
				}
			}
		}
	}

	public static interface CreateNewObjectFunctionInterface<R> {
		public R createNew();
	}

	public static interface CheckIsExistingAndExpectedFunctionInterface<A, R> {
		public R check(A a);
	}

	private void persist(Object... objectsToPersist) {
		EntityManager em = JPA.em();
		for (Object objectToPersist : objectsToPersist) {
			em.persist(objectToPersist);
		}
		em.flush();
	}

	private void doCreateObject(String reference, boolean canBeCached, ExampleObjectCreator function, long id) {
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

}
