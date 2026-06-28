import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  productService,
  categoryService,
  articleService,
  menuService,
  settingService,
  bannerService,
  mediaService
} from '@/services';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const url = new URL(request.url);
  const summary = url.searchParams.get('summary') === '1';
  const id = url.searchParams.get('id');

  try {
    if (id) {
      let item;
      switch (type) {
        case 'products': item = await productService.getById(id); break;
        case 'articles': item = await articleService.getById(id); break;
        default:
          return NextResponse.json({ error: 'Invalid data type for id lookup' }, { status: 400 });
      }
      if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(item);
    }

    let data;
    switch (type) {
      case 'products':
        data = summary ? await productService.getAllSummary() : await productService.getAll();
        break;
      case 'categories':
        data = await categoryService.getAll();
        break;
      case 'articles':
        data = summary ? await articleService.getAllSummary() : await articleService.getAll();
        break;
      case 'menus':
        data = await menuService.getAll();
        break;
      case 'settings':
        data = await settingService.get();
        break;
      case 'banners':
        data = await bannerService.getAll();
        break;
      case 'media-gallery':
        data = {
          images: await mediaService.getImages(),
          videos: await mediaService.getVideos()
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  
  // Basic security check for modification requests
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.ADMIN_SECRET_TOKEN || 'binovet-dev-token';
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Fallback for legacy format where the body IS the data
    let action = body.action;
    let data = body.data;
    let id = body.id || (data && typeof data === 'object' ? data.id : undefined);

    if (!action && !data && type !== 'media-gallery') {
      data = body;
      // For settings, it's always an update
      if (type === 'settings') action = 'update';
    }

    // Helper function for CRUD operations
    const getService = () => {
      switch (type) {
        case 'products': return productService;
        case 'categories': return categoryService;
        case 'articles': return articleService;
        case 'menus': return menuService;
        case 'banners': return bannerService;
        default: return null;
      }
    };

    // Handle settings separately
    if (type === 'settings') {
      await settingService.update(data);
      revalidatePath('/', 'layout');
      return NextResponse.json({ success: true });
    }

    // Handle media-gallery separately
    if (type === 'media-gallery') {
      const { mediaType } = body; // 'image' or 'video'
      if (mediaType === 'image') {
        if (action === 'create') await mediaService.addImage(data);
        else if (action === 'update') await mediaService.updateImage(id, data);
        else if (action === 'delete') await mediaService.deleteImage(id);
      } else if (mediaType === 'video') {
        if (action === 'create') await mediaService.addVideo(data);
        else if (action === 'update') await mediaService.updateVideo(id, data);
        else if (action === 'delete') await mediaService.deleteVideo(id);
      }
      revalidatePath('/', 'layout');
      return NextResponse.json({ success: true });
    }

    const service = getService() as any;
    if (!service) {
      return NextResponse.json({ error: 'Invalid data type' }, { status: 400 });
    }

    // If data is an array, it means the frontend is trying to sync the whole list
    if (Array.isArray(data)) {
        return NextResponse.json({ 
          error: 'Legacy array sync is no longer supported. Please use individual CRUD actions (create, update, delete).' 
        }, { status: 400 });
    }

    // Strip 'id' from data if it exists to avoid Prisma conflicts during create/update
    if (data && typeof data === 'object' && 'id' in data) {
      delete data.id;
    }

    let result;
    const numericId = id ? Number(id) : undefined;

    switch (action) {
      case 'create':
        result = await service.create(data);
        break;
      case 'update':
        if (!numericId) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        await service.update(numericId, data);
        break;
      case 'delete':
        if (!numericId) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        await service.delete(numericId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Revalidate the main paths to clear cache
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ success: true, id: result });
  } catch (error: any) {
    console.error(`Error saving ${type}:`, error);
    return NextResponse.json({ 
      error: 'Failed to save data', 
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
