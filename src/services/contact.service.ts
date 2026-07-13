import prisma from '@/lib/prisma';

export class ContactService {
  async getAll() {
    return prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getById(id: any) {
    return prisma.contactRequest.findUnique({ where: { id: BigInt(id) as any } });
  }

  async getNewCount() {
    return prisma.contactRequest.count({ where: { status: 'new' } });
  }

  async create(data: any) {
    // Only persist known fields coming from the public contact form
    const { fullName, phoneNumber, emailAddress, messageBox, locale } = data;
    const item = await prisma.contactRequest.create({
      data: {
        fullName,
        phoneNumber,
        emailAddress: emailAddress || null,
        messageBox: messageBox || '',
        locale: locale || 'vi',
      },
    });
    return String(item.id);
  }

  async update(id: any, data: any) {
    if (!id) throw new Error('ID is required');
    const { id: _, ...updateData } = data;
    await prisma.contactRequest.update({
      where: { id: BigInt(id) as any },
      data: updateData,
    });
  }

  async delete(id: any) {
    if (!id) throw new Error('ID is required');
    await prisma.contactRequest.delete({ where: { id: BigInt(id) as any } });
  }
}

export const contactService = new ContactService();
