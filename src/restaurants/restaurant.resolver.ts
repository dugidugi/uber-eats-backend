import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
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
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete.restaurant.dto';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { Category } from './entities/category.entity';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantsInput,
  SearchRestaurantsOutput,
} from './dtos/search-restaurants.dto';

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

  @Query(() => RestaurantsOutput)
  async restuarants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(() => RestaurantOutput)
  async restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query(() => SearchRestaurantsOutput)
  async serachRestaurants(
    @Args('input') serachRestaurantsInput: SearchRestaurantsInput,
  ): Promise<SearchRestaurantsOutput> {
    return this.restaurantService.findRestaurantsByName(serachRestaurantsInput);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Number, { nullable: true })
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query(() => AllCategoriesOutput)
  async allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(() => CategoryOutput)
  async category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}
