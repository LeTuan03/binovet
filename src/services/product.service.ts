import prisma from '@/lib/prisma';

export class ProductService {
  async getAll() {
    return prisma.product.findMany({ orderBy: { id: 'asc' } });
  }

  async getAllSummary() {
    return prisma.product.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        nameEn: true,
        categoryId: true,
        image: true,
        images: true,
        featured: true,
        registrationNumber: true,
        specifications: true,
      },
    });
  }

  async getById(id: any) {
    return prisma.product.findUnique({ where: { id: BigInt(id) as any } });
  }

  async getBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug } });
  }

  async create(data: any) {
    const { id, imageSize, ...createData } = data;
    if (createData.categoryId) {
      createData.categoryId = BigInt(createData.categoryId);
    }
    const product = await prisma.product.create({ data: createData });
    return String(product.id);
  }

  async update(id: any, data: any) {
    if (!id) throw new Error('ID is required');
    const { id: _, imageSize, ...updateData } = data;
    if (updateData.categoryId) {
      updateData.categoryId = BigInt(updateData.categoryId);
    }
    await prisma.product.update({ 
      where: { id: BigInt(id) as any }, 
      data: updateData 
    });
  }

  async delete(id: any) {
    if (!id) throw new Error('ID is required');
    await prisma.product.delete({ where: { id: BigInt(id) as any } });
  }

  async getByCategoryId(categoryId: number) {
    return prisma.product.findMany({
      where: { categoryId },
      orderBy: { id: 'asc' },
    });
  }
}

export const productService = new ProductService();
