import prisma from '@/lib/prisma';

export class BannerService {
  async getAll() {
    return prisma.banner.findMany({ orderBy: { order: 'asc' } });
  }

  async getById(id: any) {
    return prisma.banner.findUnique({ where: { id: BigInt(id) as any } });
  }

  async create(data: any) {
    const { id, imageSize, ...createData } = data;
    const banner = await prisma.banner.create({ data: createData });
    return String(banner.id);
  }

  async update(id: any, data: any) {
    if (!id) throw new Error('ID is required');
    const { id: _, imageSize, ...updateData } = data;
    await prisma.banner.update({ 
      where: { id: BigInt(id) as any }, 
      data: updateData 
    });
  }

  async delete(id: any) {
    if (!id) throw new Error('ID is required');
    await prisma.banner.delete({ where: { id: BigInt(id) as any } });
  }
}

export const bannerService = new BannerService();
