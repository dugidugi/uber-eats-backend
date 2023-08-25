import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entitiy';
import { CoreOutput } from 'src/common/dtos/response.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(() => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
