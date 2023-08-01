import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CoreOutput } from 'src/common/dtos/response.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'password',
  'email',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
