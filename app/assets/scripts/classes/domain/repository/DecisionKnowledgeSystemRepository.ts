/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/DecisionKnowledgeSystem.ts' />
/// <reference path='../../domain/factory/ObjectFactory.ts' />

module dks {
	export class DecisionKnowledgeSystemRepository extends core.Repository<DecisionKnowledgeSystem> {
		constructor(httpService) {
			super(httpService);
			this.type = DecisionKnowledgeSystem;
			this.resources = {
				'all': configuration.paths.decisionKnowledgeSystem.list
			};
		}
	}
}