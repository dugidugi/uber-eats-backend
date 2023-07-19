import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurant.resolver';
import { Restaurant } from './entities/restaurant.entitiy';
import { RestaurantService } from './restaurant.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [RestaurantResolver, RestaurantService],
  imports: [TypeOrmModule.forFeature([Restaurant])],
})
export class RestaurantsModule {}
