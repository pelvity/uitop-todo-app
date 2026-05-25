import { IsString, IsNotEmpty, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  text: string;

  @IsInt()
  @IsPositive()
  categoryId: number;
}
