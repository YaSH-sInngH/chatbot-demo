// filepath: c:\Users\excellence\Documents\new-project\backend\src\users\users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Chat } from 'src/chat/entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat])],
  providers: [UsersService],
  exports: [UsersService], // Ensure UsersService is exported
})
export class UsersModule {}