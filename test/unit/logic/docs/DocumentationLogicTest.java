package logic.docs;

import logics.docs.DocumentationLogic;
import logics.docs.QueryParameters;
import org.junit.Test;
import test.AbstractDatabaseTest;

import java.util.List;

import static org.fest.assertions.Assertions.assertThat;

public class DocumentationLogicTest extends AbstractDatabaseTest {

	@Test
	public void testAllMethodsWithIdInPathHaveId() {
		for (List<DocumentationLogic.MethodDocumentation> methodDocumentations : new DocumentationLogic().getAllAPICalls().values()) {
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
