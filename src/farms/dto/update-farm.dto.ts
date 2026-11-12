import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFarmDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sizeHectares?: number;
}

