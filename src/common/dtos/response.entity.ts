import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MutationOutputDto {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
