import { User as UserEntity } from '../../modules/user/entity/user.entity';
import { Request } from '@nestjs/common';

declare global {
  namespace Express {
    interface User extends Pick<UserEntity, 'id' | 'email' | 'role'> {}
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}
