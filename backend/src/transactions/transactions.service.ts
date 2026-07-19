import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { Account, AccountDocument } from '../accounts/schemas/account.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAllByUser(
    userId: string,
    query: { limit?: number; skip?: number; category?: string; accountId?: string; search?: string },
  ) {
    const filter: any = { userId };

    if (query.category) {
      filter.category = query.category;
    }
    if (query.accountId) {
      filter.accountId = query.accountId;
    }
    if (query.search) {
      filter.description = { $regex: query.search, $options: 'i' };
    }

    const limit = query.limit ? Number(query.limit) : 20;
    const skip = query.skip ? Number(query.skip) : 0;

    const items = await this.transactionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.transactionModel.countDocuments(filter);

    return {
      items,
      total,
      limit,
      skip,
    };
  }

  async transferFunds(
    userId: string,
    fromAccountId: string,
    toAccountNumber: string,
    amount: number,
    description: string,
    category: string = 'transfer',
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be positive');
    }

    // 1. Validate source account
    const sourceAccount = await this.accountModel.findById(fromAccountId);
    if (!sourceAccount) {
      throw new NotFoundException('Source account not found');
    }
    if (sourceAccount.userId.toString() !== userId) {
      throw new ForbiddenException('You do not own the source account');
    }
    if (sourceAccount.status !== 'active') {
      throw new BadRequestException('Source account is not active');
    }
    if (sourceAccount.balance < amount) {
      throw new BadRequestException('Insufficient funds in source account');
    }

    // 2. Validate destination account
    const destAccount = await this.accountModel.findOne({ accountNumber: toAccountNumber });
    if (!destAccount) {
      throw new NotFoundException('Destination account number not found');
    }
    if (destAccount.status !== 'active') {
      throw new BadRequestException('Destination account is not active');
    }

    // 3. Process balances
    sourceAccount.balance -= amount;
    destAccount.balance += amount;

    await sourceAccount.save();
    await destAccount.save();

    // 4. Generate visual reference ID
    const refId = 'TXN-' + Math.floor(100000000 + Math.random() * 900000000).toString();

    // 5. Fetch recipient details for display in transactions
    const sourceUser = await this.userModel.findById(userId);
    const destUser = await this.userModel.findById(destAccount.userId);

    const sourceName = sourceUser ? `${sourceUser.firstName} ${sourceUser.lastName}` : 'Sender';
    const destName = destUser ? `${destUser.firstName} ${destUser.lastName}` : 'Recipient';

    // 6. Create source user ledger log (transfer_out)
    const sourceTransaction = new this.transactionModel({
      userId: sourceAccount.userId,
      accountId: sourceAccount._id,
      type: 'transfer_out',
      amount,
      description: description || `Transfer to ${destName}`,
      category,
      referenceId: refId,
      recipientName: destName,
      recipientAccount: toAccountNumber,
    });
    await sourceTransaction.save();

    // 7. Create destination user ledger log (transfer_in)
    const destTransaction = new this.transactionModel({
      userId: destAccount.userId,
      accountId: destAccount._id,
      type: 'transfer_in',
      amount,
      description: description || `Transfer from ${sourceName}`,
      category: 'income',
      referenceId: refId,
      recipientName: sourceName,
      recipientAccount: sourceAccount.accountNumber,
    });
    await destTransaction.save();

    return {
      referenceId: refId,
      sourceAccount,
      transaction: sourceTransaction,
    };
  }
}
