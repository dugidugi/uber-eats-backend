import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,

    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,

    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,

    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    { items, restaurantId }: CreateOrderInput,
    customer: User,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found.' };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne({ where: { id: item.dishId } });
        if (!dish) {
          return { ok: false, error: 'Dish not found.' };
        }
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishFinalPrice += dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices?.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice += dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice += dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );

        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      return { ok: true };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Could not create order.' };
    }
  }

  async getOrders(
    { status }: GetOrdersInput,
    user: User,
  ): Promise<GetOrdersOutput> {
    console.log(user);
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: { id: user.id },
            ...(status && { status }),
          },
        });
        return { ok: true, orders };
      } else if (user.role === UserRole.Rider) {
        orders = await this.orders.find({
          where: {
            rider: { id: user.id },
            ...(status && { status }),
          },
        });
        return { ok: true, orders };
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: { owner: { id: user.id } },
          relations: ['orders'],
        });

        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);

        if (status) {
          orders = orders.filter((order) => order.status === status);
        }
      }
      return { ok: true, orders };
    } catch (error) {
      return { ok: false, error: 'Could not get orders.' };
    }
  }

  async canSeeOrder(user: User, order: Order): Promise<boolean> {
    let canSee = true;

    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }

    if (user.role === UserRole.Rider && order.riderId !== user.id) {
      canSee = false;
    }

    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }

    return canSee;
  }

  async getOrder(
    { orderId }: GetOrderInput,
    user: User,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: orderId },
        relations: ['restaurant'],
      });

      if (!order) {
        return { ok: false, error: 'Order not found.' };
      }

      if (!this.canSeeOrder(user, order)) {
        return { ok: false, error: 'You cannot see this.' };
      }

      return { ok: true, order };
    } catch (error) {
      return { ok: false, error: 'Could not get order.' };
    }
  }
}
