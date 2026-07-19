import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get()
  async getCards(@Request() req: any) {
    return this.cardsService.findAllByUser(req.user._id);
  }

  @Post()
  async createCard(
    @Request() req: any,
    @Body('accountId') accountId: string,
    @Body('type') type: 'debit' | 'credit',
  ) {
    return this.cardsService.createCard(req.user._id, accountId, type);
  }

  @Patch(':id/block')
  async toggleBlock(@Request() req: any, @Param('id') id: string) {
    return this.cardsService.toggleBlock(req.user._id, id);
  }

  @Patch(':id/limits')
  async changeLimits(
    @Request() req: any,
    @Param('id') id: string,
    @Body('dailySpendLimit') dailySpend: number,
    @Body('dailyWithdrawLimit') dailyWithdraw: number,
  ) {
    return this.cardsService.changeLimits(req.user._id, id, dailySpend, dailyWithdraw);
  }

  @Patch(':id/pin')
  async changePin(
    @Request() req: any,
    @Param('id') id: string,
    @Body('pin') pin: string,
  ) {
    return this.cardsService.changePin(req.user._id, id, pin);
  }
}
