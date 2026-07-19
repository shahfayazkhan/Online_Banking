import { Controller, Get, Post, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  async getAccounts(@Request() req: any) {
    return this.accountsService.findAllByUser(req.user._id);
  }

  @Get(':id')
  async getAccount(@Request() req: any, @Param('id') id: string) {
    return this.accountsService.findOne(req.user._id, id);
  }

  @Post()
  async createAccount(
    @Request() req: any,
    @Body('type') type: 'checking' | 'savings' | 'credit',
    @Body('alias') alias?: string,
  ) {
    return this.accountsService.createAdditionalAccount(req.user._id, type, alias);
  }

  @Post(':id/faucet')
  @HttpCode(HttpStatus.OK)
  async useFaucet(
    @Request() req: any,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.accountsService.depositFaucet(req.user._id, id, amount);
  }
}
