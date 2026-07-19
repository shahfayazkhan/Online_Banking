import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ required: true, unique: true, index: true })
  accountNumber: string;

  @Prop({ required: true, enum: ['checking', 'savings', 'credit'], default: 'checking' })
  type: string;

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop({ required: true, enum: ['active', 'blocked', 'frozen'], default: 'active' })
  status: string;

  @Prop({ trim: true })
  alias?: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
