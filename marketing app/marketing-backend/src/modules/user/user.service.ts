import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepo.find({ select: ['id', 'role'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    //  Only admins can change roles
    if (dto.role && currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admin can change user roles');
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const result = await this.userRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return { message: 'User soft-deleted', id }; //  deletedAt auto-handled
  }
}
