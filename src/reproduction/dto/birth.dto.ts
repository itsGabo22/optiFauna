import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class BirthDto {
  @IsString()
  @IsNotEmpty()
  motherId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  calfGender: string;
}
