import prisma from '../../config/database/db';
import { IUser } from '../../interfaces/user.interface';

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async createUser(data: Omit<IUser, 'id' | 'isVerified' | 'createdAt' | 'updatedAt'>) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }

  static async verifyUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });
  }
}
