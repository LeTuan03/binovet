import prisma from '@/lib/prisma';

export class MenuService {
  async getAll() {
    return prisma.navMenu.findMany({ orderBy: { order: 'asc' } });
  }

  async getById(id: any) {
    return prisma.navMenu.findUnique({ where: { id: BigInt(id) as any } });
  }

  async create(data: any) {
    const { id, ...createData } = data;
    if (createData.parent) {
      createData.parent = BigInt(createData.parent);
    }
    const menu = await prisma.navMenu.create({ data: createData });
    return String(menu.id);
  }

  async update(id: any, data: any) {
    if (!id) throw new Error('ID is required');
    const { id: _, ...updateData } = data;
    if (updateData.parent) {
      updateData.parent = BigInt(updateData.parent);
    }
    await prisma.navMenu.update({ 
      where: { id: BigInt(id) as any }, 
      data: updateData 
    });
  }

  async delete(id: any) {
    if (!id) throw new Error('ID is required');
    await prisma.navMenu.delete({ where: { id: BigInt(id) as any } });
  }
}

export const menuService = new MenuService();
