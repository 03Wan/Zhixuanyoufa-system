import { RuleType, RiskLevel } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  name!: string;

  @IsEnum(RuleType)
  type!: RuleType;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsEnum(RiskLevel)
  riskLevel!: RiskLevel;

  @IsArray()
  keywords!: string[];

  @IsString()
  suggestion!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
