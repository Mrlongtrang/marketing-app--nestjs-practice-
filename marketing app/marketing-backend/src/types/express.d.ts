
import { User } from '../../modules/user/entity/user.entity';
import { Request } from '@nestjs/common';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<Pick<User, 'id' | 'email' | 'role'>>;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}