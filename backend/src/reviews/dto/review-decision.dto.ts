import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ReviewDecisionDto {
  @IsString()
  @IsIn(['通过发布', '退回优化', '暂缓发布'])
  decision!: '通过发布' | '退回优化' | '暂缓发布';

  @IsString()
  @MinLength(1)
  reason!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

