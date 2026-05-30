import { IsOptional, IsString } from 'class-validator';

export class CreateMaterialDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  sellingPoints?: string;

  @IsOptional()
  @IsString()
  detailText?: string;

  @IsOptional()
  @IsString()
  adText?: string;

  @IsOptional()
  imageUrls?: string[];
}
