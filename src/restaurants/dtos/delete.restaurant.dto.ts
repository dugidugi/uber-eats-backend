import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/response.entity';

@InputType()
export class DeleteRestaurantInput extends CoreOutput {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
