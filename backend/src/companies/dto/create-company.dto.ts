import { IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name!: string;

  @IsOptional() @IsString() industryType?: string;
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() targetMarkets?: string[];
  @IsOptional() @IsString() planType?: string;
  @IsOptional() @IsString() serviceStatus?: string;
}
