import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { MutationOutputDto } from 'src/common/dtos/response.entity';

@InputType()
export class CreateAccountInputDto extends PickType(User, [
  'password',
  'email',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutputDto extends MutationOutputDto {}
