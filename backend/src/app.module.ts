import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    UsersModule,  // Make sure UsersModule is imported
    AuthModule, 
    ChatModule,
  ],
})
export class AppModule {}