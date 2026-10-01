import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class InseminationDto {
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  bullIdOrSemen: string;
}
