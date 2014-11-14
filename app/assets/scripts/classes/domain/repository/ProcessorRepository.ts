/// <reference path='../../../configuration/paths.ts' />

/// <reference path='../../domain/repository/Repository.ts' />
/// <reference path='../../domain/model/Processor.ts' />

module app.domain.repository.core {
    export class ProcessorRepository extends app.domain.repository.core.Repository<app.domain.model.core.Processor> {
        constructor(httpService) {
            super(httpService);
            this.type = app.domain.model.core.Processor;
            this.resources = configuration.paths.processor;
        }
    }
}