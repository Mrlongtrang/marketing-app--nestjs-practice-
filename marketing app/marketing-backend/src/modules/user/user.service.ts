import { Injectable, NotFoundException, ForbiddenException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepo.find({ select: ['id', 'username', 'role'] });
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    //  Only admins can change roles
    if (dto.role && currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admin can change user roles');
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
  }
}
