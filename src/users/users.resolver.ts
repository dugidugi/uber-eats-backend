import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  CreateAccountInputDto,
  CreateAccountOutputDto,
} from './dtos/create-account.dto';
import { LoginInputDto, LoginOutputDto } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => String)
  getAll() {
    return this.usersService.getAll();
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me() {
    return;
  }

  @Mutation(() => CreateAccountOutputDto)
  async createAccount(
    @Args('input') createAccountInputDto: CreateAccountInputDto,
  ): Promise<CreateAccountOutputDto> {
    try {
      return this.usersService.createAccount(createAccountInputDto);
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }

  @Mutation(() => Boolean)
  async login(
    @Args('input') loginInputDto: LoginInputDto,
  ): Promise<LoginOutputDto> {
    try {
      return this.usersService.login(loginInputDto);
    } catch (error) {
      return {
        error,
        ok: false,
      };
    }
  }
}
