import { CoreOutput } from 'src/common/dtos/response.entity';
import { Payment } from '../entities/payment.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetPaymentsOutput extends CoreOutput {
  @Field((type) => [Payment], { nullable: true })
  payments?: Payment[];
}
