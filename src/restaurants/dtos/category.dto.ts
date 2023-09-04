import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/response.entity';
import { Category } from '../entities/category.entitiy';

@ArgsType()
export class CategoryInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class CategoryOutput extends CoreOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
}
