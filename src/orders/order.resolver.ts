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
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constant';
import { Order } from './entities/order.entity';
import { UpdateOrderInput } from './dtos/update-orders.dto';

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

  @Role(['Owner'])
  @Subscription(() => Order, {
    filter: (payload, variables, context) => {
      return context.user.id === payload.pendingOrders.ownerId;
    },
    resolve: ({ pendingOrders: { order } }) => {
      return order;
    },
  })
  pendingOrders(@AuthUser() user: User) {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Role(['Rider'])
  @Subscription(() => Order, {
    filter: (payload, variables, context) => {
      return true;
    },
  })
  cookedOrders(@AuthUser() user: User) {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Role(['Any'])
  @Subscription(() => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: UpdateOrderInput },
      { user }: { user: User },
    ) => {
      if (
        order.riderId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }

      return input.id === order.id;
    },
  })
  orderUpdates(@Args('input') updateOrderInput: UpdateOrderInput) {
    return this.pubsub.asyncIterator(NEW_ORDER_UPDATE);
  }
}
