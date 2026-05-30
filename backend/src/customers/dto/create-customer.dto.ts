import { IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name!: string;
  @IsOptional() @IsString() customerType?: string;
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() targetPlatform?: string;
  @IsOptional() @IsString() targetMarket?: string;
  @IsOptional() @IsString() planType?: string;
  @IsOptional() @IsString() serviceStatus?: string;
  @IsOptional() @IsString() remark?: string;
  @IsOptional() @IsString() companyId?: string;
}
