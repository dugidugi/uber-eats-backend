import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [UsersService, UsersResolver],
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
})
export class UsersModule {}
