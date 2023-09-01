import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantInput } from './create.restaurant.dto';
import { CoreOutput } from 'src/common/dtos/response.entity';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
