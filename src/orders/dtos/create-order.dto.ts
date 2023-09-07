import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/response.entity';
import { Order } from '../entities/order.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, ['dishes']) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
