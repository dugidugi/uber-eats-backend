import { Module } from '@nestjs/common';
import { CategoryResolver, RestaurantResolver } from './restaurant.resolver';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Module({
  providers: [RestaurantResolver, CategoryResolver, RestaurantService],
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
})
export class RestaurantsModule {}
