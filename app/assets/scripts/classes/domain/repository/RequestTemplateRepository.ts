/// <reference path='../../../configuration/paths.ts' />

/// <reference path='../../domain/repository/Repository.ts' />
/// <reference path='../../domain/model/RequestTemplate.ts' />

module app.domain.repository.ppt {
	export class RequestTemplateRepository extends app.domain.repository.core.Repository<app.domain.model.ppt.RequestTemplate> {
		constructor(httpService) {
			super(httpService);
			this.type = app.domain.model.ppt.RequestTemplate;
			this.resources = configuration.paths.requestTemplate;
		}
	}
}