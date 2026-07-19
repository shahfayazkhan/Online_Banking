import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Card, CardDocument } from './schemas/card.schema';
import { Account, AccountDocument } from '../accounts/schemas/account.schema';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async findAllByUser(userId: string): Promise<Card[]> {
    return this.cardModel.find({ userId: userId as any }).populate('accountId').exec();
  }

  async toggleBlock(userId: string, cardId: string): Promise<Card> {
    const card = await this.cardModel.findById(cardId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    if (card.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    card.status = card.status === 'active' ? 'blocked' : 'active';
    return card.save();
  }

  async changeLimits(
    userId: string,
    cardId: string,
    dailySpend: number,
    dailyWithdraw: number,
  ): Promise<Card> {
    const card = await this.cardModel.findById(cardId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    if (card.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    if (dailySpend < 0 || dailyWithdraw < 0) {
      throw new BadRequestException('Limits must be non-negative values');
    }

    card.dailySpendLimit = dailySpend;
    card.dailyWithdrawLimit = dailyWithdraw;
    return card.save();
  }

  async changePin(userId: string, cardId: string, newPin: string): Promise<Card> {
    const card = await this.cardModel.findById(cardId);
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    if (card.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this card');
    }

    if (!/^\d{4}$/.test(newPin)) {
      throw new BadRequestException('PIN must be exactly 4 digits');
    }

    card.pin = await bcrypt.hash(newPin, 10);
    return card.save();
  }

  async createCard(userId: string, accountId: string, type: 'debit' | 'credit'): Promise<Card> {
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new NotFoundException('Linked account not found');
    }
    if (account.userId.toString() !== userId) {
      throw new ForbiddenException('You do not own this account');
    }

    // Generate credit/debit card numbers
    let cardNum = type === 'credit' ? '5100' : '4000';
    for (let i = 0; i < 3; i++) {
      cardNum += String(Math.floor(1000 + Math.random() * 9000));
    }

    const expiryYear = (new Date().getFullYear() + 5).toString().slice(-2);
    const expiryMonth = String(new Date().getMonth() + 1).padStart(2, '0');

    // Fetch user details or generic for holder name
    const newCard = new this.cardModel({
      userId,
      accountId,
      cardNumber: cardNum,
      cardHolder: 'VALUED CUSTOMER',
      expiryDate: `${expiryMonth}/${expiryYear}`,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      type,
      status: 'active',
      dailySpendLimit: type === 'credit' ? 5000 : 2500,
      dailyWithdrawLimit: type === 'credit' ? 2000 : 1000,
      pin: await bcrypt.hash('1234', 10),
    });

    return newCard.save();
  }
}
