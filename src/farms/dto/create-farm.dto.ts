import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateFarmDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @IsOptional()
  sizeHectares?: number;

  @IsString()
  @IsOptional()
  ownerId?: string;
}
