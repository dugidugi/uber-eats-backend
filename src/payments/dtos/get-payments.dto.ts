import { CoreOutput } from 'src/common/dtos/response.entity';
import { Payment } from '../entities/payment.entity';
import { Field } from '@nestjs/graphql';

export class GetPaymentsOutput extends CoreOutput {
  @Field((type) => [Payment], { nullable: true })
  payments?: Payment[];
}
