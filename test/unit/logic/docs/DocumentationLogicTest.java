package logic.docs;

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
import logics.docs.DocumentationLogic;
import logics.docs.QueryParameters;
import logics.user.UserLogic;
import org.junit.Test;
import test.AbstractDatabaseTest;

import java.security.SecureRandom;
import java.util.List;

import static org.fest.assertions.Assertions.assertThat;

public class DocumentationLogicTest extends AbstractDatabaseTest {

	@Test
	public void testAllMethodsWithIdInPathHaveId() {
		UserDAO userDao = new UserDAO();
		DocumentationLogic documentationLogic = new DocumentationLogic(new UserLogic(userDao, new SecureRandom()), userDao, new PPTAccountDAO(), new ProjectPlanningToolDAO(), new TaskTemplateDAO(), new TaskPropertyDAO(), new TaskPropertyValueDAO(), new DKSMappingDAO(), new RequestTemplateDAO(), new ProjectDAO(), new ProcessorDAO(), new DecisionKnowledgeSystemDAO());
		for (List<DocumentationLogic.MethodDocumentation> methodDocumentations : documentationLogic.getAllAPICalls().values()) {
			for (DocumentationLogic.MethodDocumentation methodDocumentation : methodDocumentations) {
				if (methodDocumentation.call.url().contains(DocumentationLogic.MAGIC_CONSTANT_PARAMETER_IDENTIFICATION + "")) {
					boolean containsAnId = false;
					for (QueryParameters.Parameter queryParameter : methodDocumentation.queryParameters) {
						if (queryParameter.isId()) {
							containsAnId = true;
						}
					}
					assertThat(containsAnId).describedAs(methodDocumentation.call + " contains an id").isTrue();
				}
			}
		}
	}

}
