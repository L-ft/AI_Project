import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBuilderConnectionCryptoService } from '../data-builder/data-builder-connection-crypto.service';
import { DataBuilderPrimaryTaskStoreService } from '../data-builder/data-builder-primary-task-store.service';
import { DataBuilderTaskOrchestrationService } from '../data-builder/data-builder-task-orchestration.service';
import { DataBuilderTaskSchemaService } from '../data-builder/data-builder-task-schema.service';
import { DataBuilderTaskShadowStoreService } from '../data-builder/data-builder-task-shadow-store.service';
import { ManifestDraftService } from '../data-builder/manifest-draft.service';
import { ManifestValidateService } from '../data-builder/manifest-validate.service';
import { DataBuilderTask, DataBuilderTaskBatch } from '../entities/data-builder-task.entity';
import { DataBuilderTasksProxyController } from './data-builder-tasks-proxy.controller';
import { DataBuilderTasksProxyService } from './data-builder-tasks-proxy.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([DataBuilderTask, DataBuilderTaskBatch])],
  controllers: [DataBuilderTasksProxyController],
  providers: [
    DataBuilderTasksProxyService,
    ManifestValidateService,
    ManifestDraftService,
    DataBuilderConnectionCryptoService,
    DataBuilderPrimaryTaskStoreService,
    DataBuilderTaskShadowStoreService,
    DataBuilderTaskSchemaService,
    DataBuilderTaskOrchestrationService,
  ],
})
export class DataBuilderTasksProxyModule {}
