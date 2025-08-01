import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [UsersModule, MemoryModule]
})
export class ChatModule {}
