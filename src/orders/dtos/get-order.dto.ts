import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/response.entity';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderInput {
  @Field((type) => Number)
  orderId: number;
}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
