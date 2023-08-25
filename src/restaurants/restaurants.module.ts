import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurant.resolver';
import { Restaurant } from './entities/restaurant.entitiy';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entitiy';

@Module({
  providers: [RestaurantResolver, RestaurantService],
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
})
export class RestaurantsModule {}
