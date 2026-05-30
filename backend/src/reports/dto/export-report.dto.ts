import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportReportDto {
  @IsString()
  taskId!: string;

  @IsOptional()
  @IsString()
  @IsIn(['pdf', 'docx', 'json'])
  format?: 'pdf' | 'docx' | 'json';
}
