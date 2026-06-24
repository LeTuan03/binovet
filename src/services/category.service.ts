import prisma from '@/lib/prisma';

export class CategoryService {
  async getAll() {
    return prisma.category.findMany({ orderBy: { id: 'asc' } });
  }

  async getById(id: any) {
    return prisma.category.findUnique({ where: { id: BigInt(id) as any } });
  }

  async getBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  }

  async create(data: any) {
    const { id, ...createData } = data;
    const category = await prisma.category.create({ data: createData });
    return String(category.id);
  }

  async update(id: any, data: any) {
    if (!id) throw new Error('ID is required');
    const { id: _, ...updateData } = data;
    await prisma.category.update({ 
      where: { id: BigInt(id) as any }, 
      data: updateData 
    });
  }

  async delete(id: any) {
    if (!id) throw new Error('ID is required');
    await prisma.category.delete({ where: { id: BigInt(id) as any } });
  }
}

export const categoryService = new CategoryService();
