/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])], //  Enables @InjectRepository(User)
  providers: [UserService],                    //  Business logic
  controllers: [UserController],               //  HTTP routes
})
export class UserModule {}
