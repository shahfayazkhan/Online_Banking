import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Account } from '../../accounts/schemas/account.schema';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account', required: true, index: true })
  accountId: Account;

  @Prop({ required: true, unique: true, index: true })
  cardNumber: string;

  @Prop({ required: true, trim: true })
  cardHolder: string;

  @Prop({ required: true })
  expiryDate: string;

  @Prop({ required: true })
  cvv: string;

  @Prop({ required: true, enum: ['debit', 'credit'], default: 'debit' })
  type: string;

  @Prop({ required: true, enum: ['active', 'blocked', 'frozen'], default: 'active' })
  status: string;

  @Prop({ required: true, default: 2000 })
  dailySpendLimit: number;

  @Prop({ required: true, default: 1000 })
  dailyWithdrawLimit: number;

  @Prop({ required: true })
  pin: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
