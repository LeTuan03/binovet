"use client";

import React, { useState, useEffect } from 'react';
import { Upload, App as AntdApp } from 'antd';
import { PlayCircleOutlined, DeleteOutlined, LoadingOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { uploadFile } from '@/lib/storage-provider';

interface VideoUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  label = 'Tải video lên',
}) => {
  const { message: messageApi } = AntdApp.useApp();
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(value);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setVideoUrl(value);
  }, [value]);

  const beforeUpload = (file: any) => {
    const isVideo = file.type.startsWith('video/');
    if (!isVideo) {
      messageApi.error('Bạn chỉ có thể tải lên file video!');
      return false;
    }
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      messageApi.error('Video phải nhỏ hơn 50MB!');
      return false;
    }
    return true;
  };

  const customUpload = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    try {
      setLoading(true);
      setPercent(0);
      
      const bucket = 'videos';
      // Use originFileObj if available
      const rawFile = (file as any).originFileObj || file;
      const url = await uploadFile(rawFile as File, bucket, (progress: number) => {
        setPercent(Math.round(progress));
        onProgress({ percent: progress });
      });
      
      setVideoUrl(url);
      onChange?.(url);
      onSuccess('ok');
    } catch (error) {
      console.error('Upload error:', error);
      messageApi.error('Tải video lên thất bại!');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoUrl(undefined);
    onChange?.('');
  };

  return (
    <div className="w-full">
      <Upload
        accept="video/*"
        showUploadList={false}
        customRequest={customUpload}
        beforeUpload={beforeUpload}
        className="upload-fill"
      >
        <div className="relative w-full min-h-[120px] rounded-2xl border-2 border-dashed border-gray-100 hover:border-primary transition-all bg-gray-50/50 flex flex-col items-center justify-center p-6 cursor-pointer group">
          {videoUrl ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                <PlayCircleOutlined className="text-2xl" />
              </div>
              <div className="text-[11px] font-bold text-gray-500 truncate max-w-full px-4 mb-2">
                {videoUrl}
              </div>
              <button 
                onClick={onRemove}
                className="text-xs text-red-500 font-bold hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <DeleteOutlined /> Xóa video
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:shadow-md transition-all mb-3">
                {loading ? <LoadingOutlined className="text-xl" /> : <VideoCameraOutlined className="text-xl" />}
              </div>
              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">
                {label}
              </div>
              <div className="mt-2 text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
                MP4, WebM • MAX 50MB
              </div>
            </>
          )}
          {loading && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-8">
                <div className="w-full text-center">
                   <LoadingOutlined className="text-3xl text-primary mb-4" />
                   <div className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Đang tải video lên...</div>
                </div>
             </div>
          )}
        </div>
      </Upload>
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

export default VideoUpload;
