import prisma from '@/lib/prisma';
import { Setting } from '@/types';

export class SettingService {
  async get(): Promise<Setting> {
    const setting = await (prisma.setting as any).findUnique({ where: { id: 1 } });
    if (!setting) {
      // Create default settings if not exists
      const created = await (prisma.setting as any).create({
        data: { id: 1, data: {} },
      });
      return created.data as unknown as Setting;
    }
    return setting.data as unknown as Setting;
  }

  async update(data: Partial<Setting>) {
    const current = await this.get();
    const merged = { ...current, ...data };
    await (prisma.setting as any).upsert({
      where: { id: 1 },
      create: { id: 1, data: merged as any },
      update: { data: merged as any },
    });
  }
}

export const settingService = new SettingService();
