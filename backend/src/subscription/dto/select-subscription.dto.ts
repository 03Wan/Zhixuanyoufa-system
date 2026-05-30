import { IsOptional, IsString } from 'class-validator';

export class SelectSubscriptionDto {
  @IsString()
  planName!: string;

  @IsOptional()
  @IsString()
  companyName?: string;
}
