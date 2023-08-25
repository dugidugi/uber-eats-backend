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

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async createRestaurant(
    createRestarantInput: CreateRestaurantInput,
    owner: User,
  ): Promise<CreateRestaurantOutput> {
    const newRestaurant = this.restaurants.create(createRestarantInput);
    newRestaurant.owner = owner;

    const categoryName = createRestarantInput.categoryName
      .trim()
      .toLocaleLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.categories.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName }),
      );
    }

    try {
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create restaurant' };
    }
  }
}
