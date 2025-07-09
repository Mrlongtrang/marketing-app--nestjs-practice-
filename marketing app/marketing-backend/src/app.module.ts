import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { LeadModule } from './modules/lead/lead.module';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/user.entity';
import { Lead } from './modules/lead/lead.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), //  load .env globally
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        entities: [User, Lead],
        synchronize: true, //  deploy only
      }),
    }),
    AuthModule,
    LeadModule,
    UserModule,
  ],
})
export class AppModule {}
