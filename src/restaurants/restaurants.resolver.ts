import { Args, Query, Resolver } from '@nestjs/graphql';
import { Restaurants } from './entities/restaurants.entitiy';

@Resolver()
export class RestaurantsResolver {
  @Query(() => [Restaurants])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurants[] {
    console.log(veganOnly);
    return [];
  }
}
