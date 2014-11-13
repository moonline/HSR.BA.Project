/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/PPTAccount.ts' />

module app.domain.repository.ppt {
	export class PPTAccountRepository extends app.domain.repository.core.Repository<app.domain.model.ppt.PPTAccount> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.ppt.PPTAccount;
			this.resources = configuration.paths.pptAccount;
		}
	}
}