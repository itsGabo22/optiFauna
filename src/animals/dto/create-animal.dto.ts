import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateAnimalDto {
  @IsString()
  @IsNotEmpty()
  tagId: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;
}
