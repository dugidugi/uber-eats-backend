import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create.restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import { Role } from 'src/auth/auth.decorator';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit.restaurant.dto';
import { CoreOutput } from 'src/common/dtos/response.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantsInput,
  SearchRestaurantsOutput,
} from './dtos/search-restaurants.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,

    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  private async getOrCreateCategory(name: string) {
    const categoryName = name.trim().toLocaleLowerCase().replace(/ /g, '-');

    const categorySlug = categoryName.replace(/ /g, '-');

    let category = await this.categories.findOneBy({ slug: categorySlug });

    if (!category) {
      category = await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName }),
      );
    }

    return category;
  }

  @Role(['Owner'])
  async createRestaurant(
    createRestarantInput: CreateRestaurantInput,
    owner: User,
  ): Promise<CreateRestaurantOutput> {
    const newRestaurant = this.restaurants.create(createRestarantInput);
    newRestaurant.owner = owner;

    const category = await this.getOrCreateCategory(
      createRestarantInput.categoryName,
    );

    newRestaurant.category = category;

    try {
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create restaurant' };
    }
  }

  @Role(['Owner'])
  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOneBy({
        id: editRestaurantInput.restaurantId,
      });

      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: 'You can not edit a restaurant that you do not own',
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.getOrCreateCategory(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not edit Restaurant' };
    }
  }

  @Role(['Owner'])
  async deleteRestaurant(
    owner: User,
    restaurantId: number,
  ): Promise<CoreOutput> {
    try {
      const restaurant = await this.restaurants.findOneBy({ id: restaurantId });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You can not delete a restaurant that you do not own',
        };
      }

      await this.restaurants.delete({ id: restaurantId });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not delete Restaurant' };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories };
    } catch (error) {
      return { ok: false, error: 'Could not load categories' };
    }
  }

  async countRestaurants(category: Category): Promise<number> {
    try {
      const count = await this.restaurants.countBy({
        category: { id: category.id },
      });

      return count;
    } catch (error) {
      return 0;
    }
  }

  async findCategoryBySlug(
    categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({
        where: { slug: categoryInput.slug },
      });
      if (!category) {
        return { ok: false, error: 'Category not found' };
      }
      const restaurants = await this.restaurants.find({
        where: { category: { slug: categoryInput.slug } },
        skip: (categoryInput.page - 1) * 25,
        take: 25,
      });

      category.restaurants = restaurants;

      const totalResults = await this.countRestaurants(category);
      const totalPages = Math.ceil(totalResults / 25);

      return { ok: true, category, restaurants, totalPages, totalResults };
    } catch (error) {
      return { ok: false, error: 'Could not load category' };
    }
  }

  async allRestaurants(
    restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (restaurantsInput.page - 1) * 25,
        take: 25,
      });

      return { ok: true, results: restaurants, totalResults };
    } catch (error) {
      return { ok: false, error: 'Could not load restaurants' };
    }
  }

  async findRestaurantById(
    restuarantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restuarantInput.restaurantId },
      });
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      return { ok: true, restaurant };
    } catch (error) {
      return { ok: false, error: 'Could not find restaurant' };
    }
  }

  async findRestaurantsByName(
    serachRestaurantsInput: SearchRestaurantsInput,
  ): Promise<SearchRestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: ILike(`%${serachRestaurantsInput.query}%`),
        },
      });

      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }
}
