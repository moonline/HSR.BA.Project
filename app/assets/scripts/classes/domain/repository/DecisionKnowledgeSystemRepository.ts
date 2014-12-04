/// <reference path='../../../configuration/paths.ts' />

/// <reference path='../../domain/repository/Repository.ts' />
/// <reference path='../../domain/model/DecisionKnowledgeSystem.ts' />

module app.domain.repository.dks {
	export class DecisionKnowledgeSystemRepository extends app.domain.repository.core.Repository<app.domain.model.dks.DecisionKnowledgeSystem> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.dks.DecisionKnowledgeSystem;
			this.resources = configuration.paths.decisionKnowledgeSystem;
		}
	}
}