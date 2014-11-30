package controllers.ppt;

import controllers.AbstractCRUDController;
import controllers.GuaranteeAuthenticatedUser;
import daos.ppt.ProcessorDAO;
import logics.docs.*;
import logics.ppt.ProcessorLogic;
import models.ppt.Processor;
import org.jetbrains.annotations.NotNull;
import controllers.Transactional;
import play.mvc.Result;

public class ProcessorController extends AbstractCRUDController {
	private final ProcessorLogic PROCESSOR_LOGIC;
	private final ProcessorDAO PROCESSOR_DAO;

	public ProcessorController(ProcessorLogic processorLogic, ProcessorDAO processorDAO, DocumentationLogic documentationLogic) {
		super(documentationLogic);
		PROCESSOR_LOGIC = processorLogic;
		PROCESSOR_DAO = processorDAO;
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@QueryParameters.Parameter(name = "name", description = "a speaking name to identify the processor"),
			@QueryParameters.Parameter(name = "project", description = "a reference (ID) to the Project"),
			@QueryParameters.Parameter(name = "code", description = "JavaScript code of the processor")
	})
	@QueryDescription("Persists the given processor")
	@QueryResponses({
			@QueryResponses.Response(status = BAD_REQUEST, description = "If the processor could not be stored."),
			@QueryResponses.Response(status = OK, description = "If the processor was stored successfully. The processor is also returned as JSON object.")
	})
	@QueryExamples({
			@QueryExamples.Example(parameters = {"Example processor", "9999", "function(num) { return num*num; }"}),
			@QueryExamples.Example(parameters = {"Example processor", "REFERENCE_PROJECT_1000000000000000042", "function(num) { return num*num; }"})
	})
	public Result create() {
		return create(PROCESSOR_LOGIC, Processor.class);
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryParameters({
			@QueryParameters.Parameter(name = "id", isId = true, format = Long.class, description = "The id of the processor to update"),
			@QueryParameters.Parameter(name = "name", description = "a speaking name to identify the processor"),
			@QueryParameters.Parameter(name = "project", description = "a reference (ID) to the Project"),
			@QueryParameters.Parameter(name = "code", description = "JavaScript code of the processor")
	})
	@QueryDescription("Updates a processor.")
	@QueryExamples({
			@QueryExamples.Example(id = "9999", parameters = {"Example processor", "9998", "function() {}"}),
			@QueryExamples.Example(id = "REFERENCE_PROCESSOR_1000000000000000055", parameters = {"Example processor 2", "9898", "function() {}"}),
			@QueryExamples.Example(id = "REFERENCE_PROCESSOR_1000000000000000056", parameters = {"Example processor", "REFERENCE_PROJECT_1000000000000000043", "function(a) { return a+'.'+a; }"})
	})
	public Result update(long id) {
		return update(PROCESSOR_DAO, PROCESSOR_LOGIC, Processor.class, id);
	}

	@Override
	@Transactional()
	@GuaranteeAuthenticatedUser
	@QueryDescription("Deletes a processor.")
	@QueryResponses({
			@QueryResponses.Response(status = NOT_FOUND, description = "If the processor to delete could not be found."),
			@QueryResponses.Response(status = NO_CONTENT, description = "If the processor was deleted.")
	})
	@QueryExamples({
			@QueryExamples.Example(id = "9999", parameters = {}),
			@QueryExamples.Example(id = "REFERENCE_PROCESSOR_1000000000000000057", isDataCacheable = false, parameters = {})
	})
	public Result delete(long id) {
		return delete(PROCESSOR_DAO, PROCESSOR_LOGIC, id);
	}

	@NotNull
	@Override
	protected String getEntityName() {
		return "Processor";
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns one processor.")
	@QueryExamples({
			@QueryExamples.Example(id = "9999", parameters = {}),
			@QueryExamples.Example(id = "REFERENCE_PROCESSOR_1000000000000000054", parameters = {})
	})
	public Result read(long id) {
		return read(PROCESSOR_DAO, id);
	}

	@Override
	@Transactional(readOnly = true)
	@GuaranteeAuthenticatedUser
	@QueryDescription("Returns all processors.")
	public Result readAll() {
		return readAll(PROCESSOR_DAO);
	}
}
