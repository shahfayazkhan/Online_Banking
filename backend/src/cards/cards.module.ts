import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { Card, CardSchema } from './schemas/card.schema';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
