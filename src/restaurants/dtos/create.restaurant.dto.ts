import { ArgsType, InputType, OmitType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entitiy';

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType, //Restuarnt는 ObjectType 이지만, CreateRestaurantDto는 InputType이기때문에 명시하기
) {}
