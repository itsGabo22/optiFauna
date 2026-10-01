import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class ExpenseDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
