import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => Boolean)
  isVegan: boolean;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => String)
  ownersName: string;

  @Column()
  @Field(() => String)
  categoryName: string;
}
