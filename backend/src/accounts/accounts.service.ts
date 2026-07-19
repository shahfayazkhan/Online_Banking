import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  async findAllByUser(userId: string): Promise<Account[]> {
    return this.accountModel.find({ userId: userId as any }).exec();
  }

  async findOne(userId: string, accountId: string): Promise<Account> {
    const account = await this.accountModel.findById(accountId).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this account');
    }
    return account;
  }

  async depositFaucet(userId: string, accountId: string, amount: number): Promise<Account> {
    const account = await this.accountModel.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    if (account.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this account');
    }

    if (amount <= 0) {
      throw new ForbiddenException('Amount must be positive');
    }

    // Atomic increment of balance
    account.balance += amount;
    const updatedAccount = await account.save();

    // Create a transaction record
    const transaction = new this.transactionModel({
      userId,
      accountId: account._id,
      type: 'deposit',
      amount,
      description: 'Faucet Simulator Deposit',
      category: 'income',
      referenceId: 'DEP-' + Math.floor(100000000 + Math.random() * 900000000).toString(),
      recipientName: 'Self',
    });
    await transaction.save();

    return updatedAccount;
  }

  async createAdditionalAccount(userId: string, type: 'checking' | 'savings' | 'credit', alias?: string): Promise<Account> {
    const accountNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const newAccount = new this.accountModel({
      userId,
      accountNumber: accountNum,
      type,
      balance: 0,
      currency: 'USD',
      status: 'active',
      alias: alias || `${type.charAt(0).toUpperCase() + type.slice(1)} Account`,
    });
    return newAccount.save();
  }
}
