import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Account } from '../../accounts/schemas/account.schema';
import { Transaction } from '../../transactions/schemas/transaction.schema';

export type BillPaymentDocument = BillPayment & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class BillPayment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account', required: true, index: true })
  accountId: Account;

  @Prop({ required: true })
  billerName: string;

  @Prop({ required: true })
  billerCode: string;

  @Prop({ required: true })
  referenceNumber: string; // The user's account identifier with the biller (e.g., utility account number)

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['success', 'failed'], default: 'success' })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Transaction', required: true })
  transactionId: Transaction;

  createdAt: Date;
}

export const BillPaymentSchema = SchemaFactory.createForClass(BillPayment);
