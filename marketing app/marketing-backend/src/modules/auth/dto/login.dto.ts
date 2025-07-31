import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'longtrang1991',
    description: 'The user’s password (must match what was registered)',
  })
  @IsString()
  password: string;
}
