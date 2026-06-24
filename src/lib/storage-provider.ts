import { adminFetch } from './api';

/**
 * Storage utility for handling file uploads.
 */

export async function uploadFile(file: File, bucket: string, onProgress?: (percent: number) => void): Promise<string> {
  console.log(`Uploading ${file.name} to bucket: ${bucket}...`);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucket', bucket);

  try {
    // In a real browser environment, we can't easily track progress with fetch
    // but we can simulate it or just wait for the response.
    if (onProgress) onProgress(10);
    
    const response = await adminFetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (onProgress) onProgress(100);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Upload error details:', error);
    throw error;
  }
}

