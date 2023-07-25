import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  CreateAccountInputDto,
  CreateAccountOutputDto,
} from './dtos/create-account.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => String)
  getAll() {
    return this.usersService.getAll();
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
}
