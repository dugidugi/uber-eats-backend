import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entitiy';
import { CreateRestaurantDto } from './dtos/create.restaurant.dto';
import { RestaurantService } from './restaurant.service';

@Resolver()
export class RestaurantResolver {
  // constructor(private readonly restaurantService: RestaurantService) {}
  private readonly restaurantService: RestaurantService;

  constructor(restaurantService: RestaurantService) {
    this.restaurantService = restaurantService;
  }

  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(() => Boolean)
  async createRestaurants(
    @Args() createRestarantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestarantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
