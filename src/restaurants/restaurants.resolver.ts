import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entitiy';
import { CreateRestaurantDto } from './dtos/create.restaurant.dto';

@Resolver()
export class RestaurantsResolver {
  @Query(() => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    console.log(veganOnly);
    return [];
  }

  @Mutation(() => Boolean)
  createRestaurants(@Args() createRestarantDto: CreateRestaurantDto): boolean {
    console.log(createRestarantDto);
    return true;
  }
}
