import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Account, AccountDocument } from '../accounts/schemas/account.schema';
import { Card, CardDocument } from '../cards/schemas/card.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const createdUser = new this.userModel({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
    });

    const user = await createdUser.save();

    // 1. Create checking account ($12,500.00 opening balance)
    const checkingAccountNum = this.generateAccountNumber();
    const checkingAccount = new this.accountModel({
      userId: user._id,
      accountNumber: checkingAccountNum,
      type: 'checking',
      balance: 12500.00,
      currency: 'USD',
      status: 'active',
      alias: 'Primary Checking',
    });
    await checkingAccount.save();

    // 2. Create savings account ($8,000.00 opening balance)
    const savingsAccountNum = this.generateAccountNumber();
    const savingsAccount = new this.accountModel({
      userId: user._id,
      accountNumber: savingsAccountNum,
      type: 'savings',
      balance: 8000.00,
      currency: 'USD',
      status: 'active',
      alias: 'High-Yield Savings',
    });
    await savingsAccount.save();

    // 3. Create active debit card linked to checking account
    const expiryYear = (new Date().getFullYear() + 5).toString().slice(-2);
    const expiryMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const debitCard = new this.cardModel({
      userId: user._id,
      accountId: checkingAccount._id,
      cardNumber: this.generateCardNumber(),
      cardHolder: `${user.firstName} ${user.lastName}`.toUpperCase(),
      expiryDate: `${expiryMonth}/${expiryYear}`,
      cvv: String(Math.floor(100 + Math.random() * 900)),
      type: 'debit',
      status: 'active',
      dailySpendLimit: 2500,
      dailyWithdrawLimit: 1000,
      pin: await bcrypt.hash('1234', 10), // Default pin 1234 hashed
    });
    await debitCard.save();

    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password || '');
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      accessToken: token,
    };
  }

  async updateProfile(userId: string, profileData: Partial<User>) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: profileData }, { new: true })
      .select('-password');
    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }
    return updatedUser;
  }

  private generateAccountNumber(): string {
    // Generate a random 10 digit number string
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  private generateCardNumber(): string {
    // Generate random 16 digit card number (4000 1234 XXXX XXXX)
    let cardNum = '4000';
    for (let i = 0; i < 3; i++) {
      cardNum += String(Math.floor(1000 + Math.random() * 9000));
    }
    return cardNum;
  }
}
