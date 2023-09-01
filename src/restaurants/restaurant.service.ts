import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entitiy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create.restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entitiy';
import { Role } from 'src/auth/auth.decorator';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit.restaurant.dto';

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
}
