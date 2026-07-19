import { Controller, Get, Post, Body, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
    @Query('category') category?: string,
    @Query('accountId') accountId?: string,
    @Query('search') search?: string,
  ) {
    return this.transactionsService.findAllByUser(req.user._id, {
      limit,
      skip,
      category,
      accountId,
      search,
    });
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  async transfer(
    @Request() req: any,
    @Body('fromAccountId') fromAccountId: string,
    @Body('toAccountNumber') toAccountNumber: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
    @Body('category') category?: string,
  ) {
    return this.transactionsService.transferFunds(
      req.user._id,
      fromAccountId,
      toAccountNumber,
      amount,
      description,
      category,
    );
  }
}
