import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private rankingService: RankingService) {}

  @Post()
  create(@Body() body: { domain: string; rank: number }) {
    return this.rankingService.create(body.domain, body.rank);
  }

  @Get(':domain')
  get(@Param('domain') domain: string) {
    return this.rankingService.fetchTrancoRank(domain);
  }
}
