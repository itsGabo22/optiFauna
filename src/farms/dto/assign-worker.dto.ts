import { IsString, IsNotEmpty } from 'class-validator';

export class AssignWorkerDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
