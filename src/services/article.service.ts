import prisma from '@/lib/prisma';

export class ArticleService {
  async getAll() {
    return prisma.article.findMany({ orderBy: { id: 'desc' } });
  }

  async getAllSummary() {
    return prisma.article.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        titleEn: true,
        category: true,
        animalTag: true,
        publishDate: true,
        thumbnail: true,
        excerpt: true,
        excerptEn: true,
        featured: true,
        isDraft: true,
      },
    });
  }

  async getById(id: any) {
    return prisma.article.findUnique({ where: { id: BigInt(id) as any } });
  }

  async getBySlug(slug: string) {
    return prisma.article.findUnique({ where: { slug } });
  }

  async create(data: any) {
    // Ensure no ID is passed to create
    const { id, status, imageSize, ...createData } = data;
    const article = await prisma.article.create({ data: createData });
    return String(article.id);
  }

  async update(id: any, data: any) {
    if (!id) throw new Error('ID is required');
    const { id: _, status, imageSize, ...updateData } = data;
    await prisma.article.update({ 
      where: { id: BigInt(id) as any }, 
      data: updateData 
    });
  }

  async delete(id: any) {
    if (!id) throw new Error('ID is required');
    await prisma.article.delete({ where: { id: BigInt(id) as any } });
  }
}

export const articleService = new ArticleService();
