/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/DecisionKnowledgeSystem.ts' />
/// <reference path='../../domain/factory/ObjectFactory.ts' />

module app.domain.repository.dks {
	export class DecisionKnowledgeSystemRepository extends app.domain.repository.core.Repository<app.domain.model.dks.DecisionKnowledgeSystem> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.dks.DecisionKnowledgeSystem;
			this.resources = configuration.paths.decisionKnowledgeSystem;
		}
	}
}