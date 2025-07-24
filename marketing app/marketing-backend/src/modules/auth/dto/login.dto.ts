import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'longtrang',
    description: 'The username of the user trying to log in',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'longtrang1991',
    description: 'The user’s password (must match what was registered)',
  })
  @IsString()
  password: string;
}
