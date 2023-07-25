import { Field, PickType } from '@nestjs/graphql';
import { MutationOutputDto } from 'src/common/dtos/response.entity';
import { User } from '../entities/user.entity';

@Object()
export class LoginInputDto extends PickType(User, ['email', 'password']) {}

@Object()
export class LoginOutputDto extends MutationOutputDto {
  @Field(() => String, { nullable: true })
  token?: string;
}
