/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Option.ts' />

module app.domain.repository.dks {
	export class OptionRepository extends app.domain.repository.core.Repository<app.domain.model.dks.Option> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.dks.Option;
			this.resources = configuration.paths.option;

			this.dataList = 'elements';
			this.proxy = configuration.paths.dks.remoteProxy;
		}
	}
}