import { Module } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { CohereService } from './cohere.service';

@Module({
  providers: [VectorStoreService, CohereService],
  exports: [VectorStoreService, CohereService],
})
export class MemoryModule {}