import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';

@Module({
  providers: [OrderService, OrderResolver],
  imports: [TypeOrmModule.forFeature([Order])],
})
export class OrdersModule {}
