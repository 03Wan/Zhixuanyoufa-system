import { Controller, Get, Param, Post, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { ReviewDecisionDto } from './dto/review-decision.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles('REVIEWER', 'SYSTEM_ADMIN')
  start(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviewsService.startReview(userId, id);
  }

  @Post(':id/decision')
  @Roles('REVIEWER', 'SYSTEM_ADMIN')
  submitDecision(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReviewDecisionDto,
  ) {
    return this.reviewsService.submitDecision(userId, id, dto);
  }
}

