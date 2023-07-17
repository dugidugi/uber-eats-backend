import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurants {
  @Field(() => String)
  name: string;

  @Field(() => Boolean, { nullable: true })
  isVegan?: boolean;
}
