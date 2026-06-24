import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export class MediaService {
  // Images
  async getImages() {
    return prisma.mediaImage.findMany({ orderBy: { order: 'asc' } });
  }

  async addImage(data: { url: string; title: string; order?: number; featured?: boolean }) {
    const image = await prisma.mediaImage.create({ 
      data: {
        ...data,
        status: 'active'
      } 
    });
    return String(image.id);
  }

  async updateImage(id: any, data: any) {
    if (id === undefined || id === null) throw new Error('ID is required for updateImage');
    console.log(`[MediaService] Updating image ID: ${id}, Type: ${typeof id}`);
    const { id: _, ...updateData } = data;
    await prisma.mediaImage.update({ 
      where: { id: BigInt(id) as any }, 
      data: updateData 
    });
  }

  async deleteImage(id: any) {
    console.log(`[MediaService] deleteImage received ID:`, id, `Type:`, typeof id);
    if (id === undefined || id === null) throw new Error('ID is required for deleteImage');
    
    // 1. Get image info to get the file path
    const image = await prisma.mediaImage.findUnique({
      where: { id: BigInt(id) as any }
    });

    if (image && image.url) {
      try {
        // 2. Resolve physical path
        const filePath = path.join(process.cwd(), 'public', image.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[MediaService] Deleted physical file: ${filePath}`);
        }
      } catch (err) {
        console.error(`[MediaService] Error deleting file ${image.url}:`, err);
      }
    }

    // 3. Delete from DB
    console.log(`[MediaService] Deleting image record ID: ${id}`);
    await prisma.mediaImage.delete({ 
      where: { id: BigInt(id) as any } 
    });
  }

  // Videos
  async getVideos() {
    return prisma.mediaVideo.findMany({ orderBy: { order: 'asc' } });
  }

  async addVideo(data: { id?: any, url: string; title: string; thumbnail?: string; order?: number; featured?: boolean }) {
    const { id, ...createData } = data;
    const video = await prisma.mediaVideo.create({ 
      data: {
        ...createData,
        status: 'active'
      } 
    });
    return String(video.id);
  }

  async updateVideo(id: any, data: any) {
    if (id === undefined || id === null) throw new Error('ID is required for updateVideo');
    console.log(`[MediaService] Updating video ID: ${id}, Type: ${typeof id}`);
    const { id: _, ...updateData } = data;
    await prisma.mediaVideo.update({ 
      where: { id: BigInt(id) as any }, 
      data: updateData 
    });
  }

  async deleteVideo(id: any) {
    console.log(`[MediaService] deleteVideo received ID:`, id, `Type:`, typeof id);
    if (id === undefined || id === null) throw new Error('ID is required for deleteVideo');
    
    // 1. Get video info
    const video = await prisma.mediaVideo.findUnique({
      where: { id: BigInt(id) as any }
    });

    if (video) {
      try {
        // Delete video file
        if (video.url) {
          const videoPath = path.join(process.cwd(), 'public', video.url);
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }
        // Delete thumbnail file
        if (video.thumbnail) {
          const thumbPath = path.join(process.cwd(), 'public', video.thumbnail);
          if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
        }
        console.log(`[MediaService] Deleted physical files for video: ${id}`);
      } catch (err) {
        console.error(`[MediaService] Error deleting video files:`, err);
      }
    }

    // 2. Delete from DB
    await prisma.mediaVideo.delete({ 
      where: { id: BigInt(id) as any } 
    });
  }
}

export const mediaService = new MediaService();
