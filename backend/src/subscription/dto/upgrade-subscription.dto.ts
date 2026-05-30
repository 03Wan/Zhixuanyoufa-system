import { IsOptional, IsString } from 'class-validator';

export class UpgradeSubscriptionDto {
  @IsString()
  planName!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
