import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// @InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => String)
  @IsString()
  @Length(5)
  name: string;

  @Column({ default: true })
  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isVegan: boolean;

  @Column()
  @Field(() => String, { defaultValue: '강남' })
  @IsString()
  address: string;

  @Column()
  @Field(() => String)
  @IsString()
  ownersName: string;

  @Column()
  @Field(() => String)
  @IsString()
  categoryName: string;
}
