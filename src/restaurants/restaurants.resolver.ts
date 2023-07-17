import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurants } from './entities/restaurants.entitiy';
import { CreateRestaurantDto } from './dtos/create.restaurant.dto';

@Resolver()
export class RestaurantsResolver {
  @Query(() => [Restaurants])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurants[] {
    console.log(veganOnly);
    return [];
  }

  @Mutation(() => Boolean)
  createRestaurants(@Args() createRestarantDto: CreateRestaurantDto): boolean {
    console.log(createRestarantDto);
    return true;
  }
}
