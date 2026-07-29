import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.course.create({ data });
  }

  async findAll() {
    return this.prisma.course.findMany({
      where: { deletedAt: null, isPublished: true },
      include: { academy: true, modules: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { academy: true, modules: true, enrollments: true },
    });
  }

  async enroll(courseId: string, userId: string) {
    return this.prisma.courseEnrollment.create({
      data: { courseId, userId },
    });
  }
}
