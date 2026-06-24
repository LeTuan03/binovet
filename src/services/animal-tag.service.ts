import prisma from '@/lib/prisma';

export class AnimalTagService {
  async getAll() {
    return prisma.animalTag.findMany({ orderBy: { id: 'asc' } });
  }

  async getById(id: any) {
    return prisma.animalTag.findUnique({ where: { id: BigInt(id) as any } });
  }

  async getBySlug(slug: string) {
    return prisma.animalTag.findUnique({ where: { slug } });
  }

  async create(data: any) {
    const { id, imageSize, ...createData } = data;
    const tag = await prisma.animalTag.create({ data: createData });
    return String(tag.id);
  }

  async update(id: any, data: any) {
    if (!id) throw new Error('ID is required');
    const { id: _, imageSize, ...updateData } = data;
    await prisma.animalTag.update({ 
      where: { id: BigInt(id) as any }, 
      data: updateData 
    });
  }

  async delete(id: any) {
    if (!id) throw new Error('ID is required');
    await prisma.animalTag.delete({ where: { id: BigInt(id) as any } });
  }
}

export const animalTagService = new AnimalTagService();
