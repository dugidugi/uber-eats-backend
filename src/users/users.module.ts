import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Module({
  providers: [UsersService, UsersResolver],
  imports: [TypeOrmModule.forFeature([User, Verification])],
  exports: [UsersService],
})
export class UsersModule {}
