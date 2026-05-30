import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateBatchTaskDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsArray()
  items!: Array<{
    sku?: string;
    productName: string;
    category: string;
    platform: string;
    market: string;
    purpose: string;
    title: string;
    sellingPoints: string;
    detailText: string;
    adText: string;
  }>;
}
