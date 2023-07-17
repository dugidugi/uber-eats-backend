import { Query, Resolver } from '@nestjs/graphql';
import { Restaurants } from './entities/restaurants.entitiy';

@Resolver()
export class RestaurantsResolver {
  @Query(() => Restaurants)
  myRestaurants() {
    return true;
  }
}
