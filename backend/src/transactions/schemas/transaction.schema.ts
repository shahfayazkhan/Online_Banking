import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Account } from '../../accounts/schemas/account.schema';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Transaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account', required: true, index: true })
  accountId: Account;

  @Prop({
    required: true,
    enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'bill_payment'],
  })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    required: true,
    enum: ['food', 'shopping', 'utilities', 'housing', 'transfer', 'income', 'leisure', 'other'],
    default: 'other',
  })
  category: string;

  @Prop({ required: true, unique: true, index: true })
  referenceId: string;

  @Prop({ trim: true })
  recipientName?: string;

  @Prop({ trim: true })
  recipientAccount?: string;

  createdAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
