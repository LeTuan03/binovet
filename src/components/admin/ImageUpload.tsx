"use client";

import React, { useState, useEffect } from 'react';
import { Upload, App as AntdApp, Image as AntImage } from 'antd';
import { PlusOutlined, DeleteOutlined, LoadingOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { uploadFile } from '@/lib/storage-provider';
import ImageEditor from './ImageEditor';

interface ImageUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  aspectRatio?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onFileChange?: (file: File | Blob) => void;
  maxSize?: number;
}

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

/**
 * Tối ưu hóa dung lượng và kích thước hình ảnh (WebP)
 */
const optimizeImage = async (file: File, options: {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  targetAspectRatio?: number;
}): Promise<File | Blob> => {
  const { quality = 0.82, maxWidth = 1920, maxHeight = 1080, targetAspectRatio } = options;

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');

    // Vùng nguồn (mặc định là toàn bộ ảnh)
    let srcX = 0;
    let srcY = 0;
    let srcW = bitmap.width;
    let srcH = bitmap.height;

    // Nếu có target aspect ratio -> center-crop để ép tỉ lệ ảnh đầu ra
    if (targetAspectRatio && targetAspectRatio > 0) {
      const currentRatio = bitmap.width / bitmap.height;
      if (currentRatio > targetAspectRatio) {
        // Ảnh gốc rộng hơn -> cắt bớt 2 bên
        srcW = bitmap.height * targetAspectRatio;
        srcX = (bitmap.width - srcW) / 2;
      } else if (currentRatio < targetAspectRatio) {
        // Ảnh gốc cao hơn -> cắt bớt trên/dưới
        srcH = bitmap.width / targetAspectRatio;
        srcY = (bitmap.height - srcH) / 2;
      }
    }

    // Tỉ lệ thực tế sau khi crop
    const ratio = srcW / srcH;
    let width = srcW;
    let height = srcH;

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
    ctx.drawImage(bitmap, srcX, srcY, srcW, srcH, 0, 0, width, height);

    return new Promise((resolve) => {
      // Chuyển đổi sang WebP để giảm dung lượng tối đa
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

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Tải ảnh lên',
  aspectRatio = '1/1',
  maxWidth = 2000,
  maxHeight = 2000,
  quality = 0.8,
  onFileChange,
  maxSize = 10,
}) => {
  const { message: messageApi } = AntdApp.useApp();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(value);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string>('');

  // Parse "1920/800" hoặc "16/9" thành số (width / height). Trả về undefined nếu không hợp lệ.
  const parsedAspectRatio = React.useMemo(() => {
    if (!aspectRatio) return undefined;
    const parts = aspectRatio.split('/');
    if (parts.length !== 2) return undefined;
    const w = parseFloat(parts[0]);
    const h = parseFloat(parts[1]);
    if (!w || !h) return undefined;
    return w / h;
  }, [aspectRatio]);

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/webp';
    if (!isJpgOrPng) messageApi.error('Bạn chỉ có thể tải lên file JPG/PNG/WEBP!');
    const isLt10M = file.size / 1024 / 1024 < maxSize;
    if (!isLt10M) messageApi.error(`Hình ảnh gốc không được vượt quá ${maxSize}MB!`);
    return isJpgOrPng && isLt10M;
  };

  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const handleChange: UploadProps['onChange'] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
    }
  };

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    try {
      setLoading(true);

      // Khởi chạy thông báo xử lý
      messageApi.loading({ content: 'Đang tối ưu dung lượng ảnh...', key: 'upload_status' });

      const rawFile = file.originFileObj || file;

      // Thực hiện tối ưu hóa ảnh (center-crop về đúng aspectRatio nếu có)
      const resultFile = await optimizeImage(rawFile, {
        quality,
        maxWidth,
        maxHeight,
        targetAspectRatio: parsedAspectRatio,
      });

      // Thông báo cho component cha về file đã xử lý (để lấy size, name,...)
      onFileChange?.(resultFile);

      const bucket = 'images';
      const url = await uploadFile(resultFile as File, bucket, (progress: number) => {
        onProgress({ percent: progress });
      });

      setImageUrl(url);
      onChange?.(url);
      onSuccess?.('ok');
      messageApi.success({ content: 'Tải lên và tối ưu thành công!', key: 'upload_status', duration: 2 });
    } catch (error) {
      console.error('Upload error:', error);
      messageApi.error({ content: 'Tải ảnh lên thất bại!', key: 'upload_status' });
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl(undefined);
    onChange?.('');
  };

  const handleEditImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingImageUrl(imageUrl || '');
    setEditorVisible(true);
  };

  const handleEditorSave = async (editedBlob: Blob) => {
    try {
      setLoading(true);
      messageApi.loading({ content: 'Đang lưu ảnh đã chỉnh sửa...', key: 'upload_status' });

      const bucket = 'images';
      const url = await uploadFile(editedBlob as File, bucket, (progress: number) => {
        // Progress tracking
      });

      setImageUrl(url);
      onChange?.(url);
      setEditorVisible(false);
      messageApi.success({ content: 'Lưu ảnh chỉnh sửa thành công!', key: 'upload_status', duration: 2 });
    } catch (error) {
      console.error('Save edited image error:', error);
      messageApi.error({ content: 'Lưu ảnh chỉnh sửa thất bại!', key: 'upload_status' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl border-2 border-dashed border-gray-100 
                 hover:border-primary transition-all bg-gray-50/50 overflow-hidden group"
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0">
        <Upload
          accept="image/*"
          showUploadList={false}
          customRequest={customUpload}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          className="upload-fill"
        >
          <div
            className="flex items-center justify-center cursor-pointer w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            {imageUrl ? (
              <div className="relative w-full h-full p-2 group/img">
                <img
                  src={imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 
                             group-hover/img:opacity-100 transition-opacity 
                             flex items-center justify-center rounded-xl 
                             backdrop-blur-[2px] m-1"
                >
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 bg-white rounded-xl flex items-center 
                                 justify-center text-primary shadow-lg cursor-pointer 
                                 hover:scale-110 transition-transform"
                    >
                      <PlusOutlined className="text-lg" />
                    </div>
                    <button type='button' className="w-6 h-6 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewVisible(true);
                      }}
                    >
                      <EyeOutlined className="text-lg" />
                    </button>
                    <button
                      type='button'
                      className="w-6 h-6 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      onClick={handleEditImage}
                    >
                      <EditOutlined className="text-lg" />
                    </button>
                    <button
                      type='button'
                      className="w-6 h-6 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                      onClick={onRemove}
                    >
                      <DeleteOutlined className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                <div
                  className="w-12 h-12 bg-white rounded-2xl flex items-center 
                             justify-center text-primary shadow-sm 
                             group-hover:shadow-md transition-all mb-3"
                >
                  {loading ? (
                    <LoadingOutlined className="text-xl" />
                  ) : (
                    <PlusOutlined className="text-xl" />
                  )}
                </div>
                <div
                  className="text-[11px] font-black uppercase tracking-widest 
                             text-gray-400 text-center"
                >
                  {label}
                </div>
                <div
                  className="mt-2 text-[10px] text-gray-300 font-bold 
                             uppercase tracking-tighter"
                >
                  JPG, PNG, WEBP • Auto WebP
                </div>
              </div>
            )}
          </div>
        </Upload>
      </div>

      {imageUrl && (
        <AntImage
          src={imageUrl}
          style={{ display: 'none' }}
          preview={{
            open: previewVisible,
            onOpenChange: (visible) => setPreviewVisible(visible),
          }}
        />
      )}

      <ImageEditor
        visible={editorVisible}
        imageUrl={editingImageUrl}
        onSave={handleEditorSave}
        onCancel={() => setEditorVisible(false)}
      />

      <style>{`
        .upload-fill,
        .upload-fill .ant-upload-wrapper,
        .upload-fill .ant-upload-select,
        .upload-fill .ant-upload {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;