import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entitiy';
import { CreateRestaurantDto } from './dtos/create.restaurant.dto';
import { RestaurantService } from './restaurant.service';

@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(() => Boolean)
  createRestaurants(@Args() createRestarantDto: CreateRestaurantDto): boolean {
    console.log(createRestarantDto);
    return true;
  }
}
