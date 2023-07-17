import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class RestaurantsResolver {
  @Query(() => Boolean)
  isPizzaGood() {
    return true;
  }
}
