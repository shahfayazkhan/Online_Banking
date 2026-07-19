import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BillsService } from './bills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private billsService: BillsService) {}

  @Get('billers')
  async getBillers(): Promise<any> {
    return this.billsService.getBillers();
  }

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.billsService.getPaymentHistory(req.user._id);
  }

  @Post('pay')
  async payBill(
    @Request() req: any,
    @Body('accountId') accountId: string,
    @Body('billerCode') billerCode: string,
    @Body('referenceNumber') referenceNumber: string,
    @Body('amount') amount: number,
  ) {
    return this.billsService.payBill(
      req.user._id,
      accountId,
      billerCode,
      referenceNumber,
      amount,
    );
  }
}
