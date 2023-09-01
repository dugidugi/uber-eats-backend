import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create.restaurant.dto';
import { RestaurantService } from './restaurant.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/auth.decorator';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit.restaurant.dto';
import { CoreOutput } from 'src/common/dtos/response.entity';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete.restaurant.dto';

@Resolver()
export class RestaurantResolver {
  // constructor(private readonly restaurantService: RestaurantService) {}
  private readonly restaurantService: RestaurantService;

  constructor(restaurantService: RestaurantService) {
    this.restaurantService = restaurantService;
  }

  @Role(['Owner'])
  @Mutation(() => CreateRestaurantOutput)
  async createRestaurants(
    @Args('input') createRestaurantInput: CreateRestaurantInput,
    @AuthUser() authUser: User,
  ): Promise<CreateRestaurantOutput> {
    return await this.restaurantService.createRestaurant(
      createRestaurantInput,
      authUser,
    );
  }

  @Role(['Owner'])
  @Mutation(() => EditRestaurantOutput)
  async editRestaurants(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Role(['Owner'])
  @Mutation(() => DeleteRestaurantOutput)
  async deleteRestaurants(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput.restaurantId,
    );
  }
}
