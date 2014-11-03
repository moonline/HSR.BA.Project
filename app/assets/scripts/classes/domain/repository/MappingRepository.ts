/// <reference path='../../../configuration/paths.ts' />

/// <reference path='Repository.ts' />
/// <reference path='../../domain/model/Mapping.ts' />

module app.domain.repository.core {
	export class MappingRepository extends app.domain.repository.core.Repository<app.domain.model.core.Mapping> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.core.Mapping;
			this.resources = configuration.paths.mapping;
		}
	}
}