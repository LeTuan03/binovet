"use client";

import React, { useState, useEffect } from 'react';
import { Upload, App as AntdApp, Image as AntImage } from 'antd';
import { PlusOutlined, DeleteOutlined, LoadingOutlined, EyeOutlined } from '@ant-design/icons';
import type { RcFile, UploadProps } from 'antd/es/upload/interface';
import { uploadFile, deleteFile } from '@/lib/storage-provider';

interface MultiImageUploadProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  maxCount?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSize?: number;
}

const optimizeImage = async (file: File, options: {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}): Promise<File | Blob> => {
  const { quality = 0.82, maxWidth = 1920, maxHeight = 1080 } = options;

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    let width = bitmap.width;
    let height = bitmap.height;

    const ratio = width / height;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / ratio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = (file.name || 'image').replace(/\.[^/.]+$/, "") + ".webp";
            const processedFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(processedFile);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    });
  } catch (error) {
    console.warn('Image optimization failed, using original file:', error);
    return file;
  }
};

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  value,
  onChange,
  label = 'Thêm ảnh phụ',
  maxCount = 8,
  maxWidth = 2000,
  maxHeight = 2000,
  quality = 0.8,
  maxSize = 10,
}) => {
  const { message: messageApi } = AntdApp.useApp();
  const [images, setImages] = useState<string[]>(value || []);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const imagesRef = React.useRef<string[]>(value || []);

  useEffect(() => {
    const newValue = value || [];
    // Only update if the reference is different and content is actually different
    if (JSON.stringify(newValue) !== JSON.stringify(imagesRef.current)) {
      setImages(newValue);
      imagesRef.current = newValue;
    }
  }, [value]);

  const beforeUpload = (file: RcFile) => {
    const isValid =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/webp';
    if (!isValid) messageApi.error('Chỉ hỗ trợ JPG/PNG/WEBP!');
    const isLtMax = file.size / 1024 / 1024 < maxSize;
    if (!isLtMax) messageApi.error(`Ảnh không được vượt quá ${maxSize}MB!`);
    return isValid && isLtMax;
  };

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      setUploadCount(prev => prev + 1);
      setUploading(true);
      messageApi.loading({ content: 'Đang tối ưu & tải ảnh phụ...', key: 'multi_upload' });

      const rawFile = file.originFileObj || file;
      const resultFile = await optimizeImage(rawFile, { quality, maxWidth, maxHeight });

      const bucket = 'images';
      const url = await uploadFile(resultFile as File, bucket);

      // Use ref to always read the latest images array (avoids stale closure)
      const newImages = [...imagesRef.current, url];
      imagesRef.current = newImages;
      setImages(newImages);
      onChange?.(newImages);
      onSuccess?.('ok');
      messageApi.success({ content: 'Tải ảnh phụ thành công!', key: 'multi_upload', duration: 2 });
    } catch (error) {
      console.error('Upload error:', error);
      messageApi.error({ content: 'Tải ảnh phụ thất bại!', key: 'multi_upload' });
      onError(error);
    } finally {
      setUploadCount(prev => {
        const next = prev - 1;
        if (next <= 0) setUploading(false);
        return next;
      });
    }
  };

  const handleRemove = async (index: number) => {
    const urlToDelete = images[index];
    const newImages = images.filter((_, i) => i !== index);
    imagesRef.current = newImages;
    setImages(newImages);
    onChange?.(newImages);
    if (urlToDelete) {
      try {
        await deleteFile(urlToDelete);
      } catch (error) {
        console.error('Delete file error:', error);
        messageApi.error('Xóa file trên máy chủ thất bại!');
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Grid */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative group aspect-square rounded-xl border-2 border-gray-100 overflow-hidden bg-gray-50 hover:border-primary transition-all"
          >
            <img
              src={url}
              alt={`Ảnh phụ ${index + 1}`}
              className="w-full h-full object-contain p-1"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <button
                type="button"
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(index);
                }}
              >
                <EyeOutlined className="text-sm" />
              </button>
              <button
                type="button"
                className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
              >
                <DeleteOutlined className="text-sm" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxCount && (
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={customUpload}
            beforeUpload={beforeUpload}
            multiple
          >
            <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-primary bg-gray-50/50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all group/add">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover/add:shadow-md transition-all mb-2">
                {uploading ? (
                  <LoadingOutlined className="text-lg" />
                ) : (
                  <PlusOutlined className="text-lg" />
                )}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center px-2">
                {label}
              </div>
              <div className="mt-1 text-[9px] text-gray-300 font-bold">
                {images.length}/{maxCount}
              </div>
            </div>
          </Upload>
        )}
      </div>

      {/* Preview Modal */}
      {previewIndex !== null && images[previewIndex] && (
        <AntImage
          src={images[previewIndex]}
          style={{ display: 'none' }}
          preview={{
            open: true,
            onVisibleChange: (visible) => {
              if (!visible) setPreviewIndex(null);
            },
          }}
        />
      )}
    </div>
  );
};

export default MultiImageUpload;
