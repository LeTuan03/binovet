import prisma from '@/lib/prisma';

export class CatalogueService {
  async getAll() {
    return prisma.catalogue.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async getById(id: any) {
    return prisma.catalogue.findUnique({
      where: { id: BigInt(id) as any },
    });
  }

  async create(data: any) {
    const { id, ...createData } = data;
    const item = await prisma.catalogue.create({ data: createData });
    return String(item.id);
  }

  async update(id: any, data: any) {
    if (!id) throw new Error('ID is required');
    const { id: _, ...updateData } = data;
    await prisma.catalogue.update({
      where: { id: BigInt(id) as any },
      data: updateData,
    });
  }

  async delete(id: any) {
    if (!id) throw new Error('ID is required');
    await prisma.catalogue.delete({
      where: { id: BigInt(id) as any },
    });
  }
}

export const catalogueService = new CatalogueService();
