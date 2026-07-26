import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString() sku!: string;
  @IsString() @MinLength(2) productName!: string;
  @IsString() category!: string;
  @IsString() platform!: string;
  @IsString() market!: string;
  @IsOptional() @IsString() language?: string;
  @IsString() purpose!: string;
  @IsString() @MinLength(1) title!: string;
  @IsString() sellingPoints!: string;
  @IsString() detailText!: string;
  @IsString() adText!: string;
}
