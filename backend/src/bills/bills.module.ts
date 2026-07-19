import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { BillPayment, BillPaymentSchema } from './schemas/bill-payment.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BillPayment.name, schema: BillPaymentSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
