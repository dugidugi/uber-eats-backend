import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutputDto } from 'src/common/dtos/response.entity';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInputDto extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutputDto extends MutationOutputDto {
  @Field(() => String, { nullable: true })
  token?: string;
}
