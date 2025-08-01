import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {User} from '../../users/entities/user.entity'; // Adjust the import path as necessary
import {Chat} from '../../chat/entities/chat.entity'; // Adjust the import path as necessary

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DB_URL'),
                entities: [User, Chat],
                synchronize: true, // Set to false in production
                ssl: true, // Enable SSL for secure connections
                extra:{
                    ssl: {
                        rejectUnauthorized: false // Disable certificate validation for development; set to true in production
                    },
                },
            }),
        }),
    ],
})

export class DatabaseModule {}