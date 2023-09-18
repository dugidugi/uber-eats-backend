import { Args, Resolver } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/auth.decorator';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Role(['Owner'])
  createPayment(
    @Args('input') createPaymentInput: CreatePaymentInput,
    @AuthUser() owner: User,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(createPaymentInput, owner);
  }

  @Role(['Owner'])
  getPayments(@AuthUser() owner: User): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayments(owner);
  }
}
