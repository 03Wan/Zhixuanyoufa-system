import { Controller, Get, Param, Post, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { ReviewDecisionDto } from './dto/review-decision.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('platform') platform?: string,
    @Query('market') market?: string,
  ) {
    return this.reviewsService.list(userId, {
      page: Number(page || 1),
      pageSize: Number(pageSize || 10),
      status,
      platform,
      market,
    });
  }

  @Get(':id')
  detail(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviewsService.detail(userId, id);
  }

  @Post(':id/start')
  start(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviewsService.startReview(userId, id);
  }

  @Post(':id/decision')
  submitDecision(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReviewDecisionDto,
  ) {
    return this.reviewsService.submitDecision(userId, id, dto);
  }
}

