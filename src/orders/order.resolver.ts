import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { Role } from 'src/auth/auth.decorator';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { PUB_SUB } from 'src/common/common.constant';
import { Order } from './entities/order.entity';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Role(['Client'])
  @Mutation(() => CreateOrderOutput)
  async createOrder(
    @Args('input') createOrderInput: CreateOrderInput,
    @AuthUser() customer: User,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(createOrderInput, customer);
  }

  @Role(['Any'])
  @Query(() => GetOrdersOutput)
  async getOrders(
    @Args('input') getOrdersInput: GetOrdersInput,
    @AuthUser() user: User,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(getOrdersInput, user);
  }

  @Role(['Any'])
  @Query(() => GetOrdersOutput)
  async getOrder(
    @Args('input') getOrderInput: GetOrderInput,
    @AuthUser() user: User,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(getOrderInput, user);
  }

  @Role(['Owner', 'Rider'])
  @Mutation(() => EditOrderOutput)
  async editOrder(
    @Args('input') editOrderInput: EditOrderInput,
    @AuthUser() user: User,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(editOrderInput, user);
  }

  @Role(['Any'])
  @Mutation(() => Boolean)
  foodReady(@AuthUser() user: User, @Args('orderId') orderId: number) {
    this.pubsub.publish('newOrder', {
      orderId,
    });
    return true;
  }

  @Role(['Any'])
  @Subscription(() => String, {
    filter: (payload, variables) => payload.orderId === variables.orderId,
    resolve: (payload) => `Your order ${payload.orderId} is ready!`,
  })
  orderEvent(@Args('orderId') orderId: number, @AuthUser() user: User) {
    return this.pubsub.asyncIterator('newOrder');
  }
}
