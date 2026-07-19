import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BillPayment, BillPaymentDocument } from './schemas/bill-payment.schema';
import { Account, AccountDocument } from '../accounts/schemas/account.schema';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';

export interface Biller {
  name: string;
  code: string;
  category: string;
}

@Injectable()
export class BillsService {
  private readonly billers: Biller[] = [
    { name: 'Apex Electricity & Power', code: 'APEX-ELEC', category: 'utilities' },
    { name: 'Oasis Water Systems', code: 'OASIS-WAT', category: 'utilities' },
    { name: 'Quantum Mobile & Internet', code: 'QUANTUM-TEL', category: 'utilities' },
    { name: 'Aura Premium Health Insurance', code: 'AURA-INS', category: 'utilities' },
    { name: 'Star Streaming & Cable TV', code: 'STAR-STREAM', category: 'utilities' },
  ];

  constructor(
    @InjectModel(BillPayment.name) private billPaymentModel: Model<BillPaymentDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  async getBillers(): Promise<Biller[]> {
    return this.billers;
  }

  async payBill(
    userId: string,
    accountId: string,
    billerCode: string,
    referenceNumber: string,
    amount: number,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    const biller = this.billers.find(b => b.code === billerCode);
    if (!biller) {
      throw new NotFoundException('Biller code not found');
    }

    // 1. Validate Account
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.userId.toString() !== userId) {
      throw new ForbiddenException('You do not own this account');
    }
    if (account.status !== 'active') {
      throw new BadRequestException('Account is not active');
    }
    if (account.balance < amount) {
      throw new BadRequestException('Insufficient funds to pay this bill');
    }

    // 2. Deduct balance
    account.balance -= amount;
    await account.save();

    // 3. Create transaction record
    const refId = 'BILL-' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const transaction = new this.transactionModel({
      userId,
      accountId: account._id,
      type: 'bill_payment',
      amount,
      description: `Bill Payment to ${biller.name}`,
      category: 'utilities',
      referenceId: refId,
      recipientName: biller.name,
      recipientAccount: referenceNumber,
    });
    await transaction.save();

    // 4. Create bill payment record
    const billPayment = new this.billPaymentModel({
      userId,
      accountId: account._id,
      billerName: biller.name,
      billerCode: biller.code,
      referenceNumber,
      amount,
      status: 'success',
      transactionId: transaction._id,
    });
    await billPayment.save();

    return {
      billPayment,
      account,
    };
  }

  async getPaymentHistory(userId: string): Promise<BillPayment[]> {
    return this.billPaymentModel.find({ userId: userId as any }).sort({ createdAt: -1 }).populate('accountId').exec();
  }
}
