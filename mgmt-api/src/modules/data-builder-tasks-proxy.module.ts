import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DataBuilderTaskOrchestrationService } from '../data-builder/data-builder-task-orchestration.service';
import { ManifestDraftService } from '../data-builder/manifest-draft.service';
import { ManifestValidateService } from '../data-builder/manifest-validate.service';
import { DataBuilderTasksProxyController } from './data-builder-tasks-proxy.controller';
import { DataBuilderTasksProxyService } from './data-builder-tasks-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [DataBuilderTasksProxyController],
  providers: [
    DataBuilderTasksProxyService,
    ManifestValidateService,
    ManifestDraftService,
    DataBuilderTaskOrchestrationService,
  ],
})
export class DataBuilderTasksProxyModule {}
