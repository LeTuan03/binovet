"use client";

import React, { useState, useMemo } from 'react';
import {
  Tabs, Button, Card, Row, Col, Modal, Form, Input,
  Upload, Space, Tag, Empty,
  Switch, Tooltip, Badge, Select, Image, App
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, VideoCameraOutlined,
  PictureOutlined, PlayCircleOutlined, EyeOutlined,
  SearchOutlined, EditOutlined, StarFilled
} from '@ant-design/icons';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import VideoUpload from '@/components/admin/VideoUpload';
import { motion } from 'framer-motion';
import { adminFetch } from '@/lib/api';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

// const initialImages = [...]; 
// const initialVideos = [...];

function AdminMediaGalleryPageContent() {
  const { modal, message } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const activeTab = searchParams.get('tab') || 'images';

  const [images, setImages] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<bigint | null>(null);

  // Load data from API
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/data/media-gallery');
      const data = await res.json();
      setImages(data.images || []);
      setVideos(data.videos || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [message]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [form] = Form.useForm();

  // URL Sync
  const updateUrl = (params: { tab?: string; q?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (params.tab) newSearchParams.set('tab', params.tab);
    if (params.q !== undefined) {
      if (params.q) newSearchParams.set('q', params.q);
      else newSearchParams.delete('q');
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleTabChange = (key: string) => {
    updateUrl({ tab: key });
  };

  const handleSearch = (val: string) => {
    updateUrl({ q: val });
  };

  // Filtered Data
  const filteredImages = useMemo(() => {
    return images.filter(img => img.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [images, query]);

  const filteredVideos = useMemo(() => {
    return videos.filter(vid => vid.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [videos, query]);

  const handleView = (url: string) => {
    setPreviewImage(url);
    setPreviewOpen(true);
  };

  const handleVideoPreview = (url: string) => {
    window.open(url, '_blank');
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDeleteImage = (id: bigint) => {
    modal.confirm({
      title: 'Xóa hình ảnh?',
      content: 'Hình ảnh này sẽ không còn hiển thị ở Thư viện trang chủ.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        setGlobalLoading(true);
        try {
          const res = await adminFetch('/api/data/media-gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              mediaType: 'image',
              id: id.toString()
            }),
          });
          if (res.ok) {
            await fetchData();
            message.success('Đã xóa hình ảnh');
          } else {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Lỗi khi xóa dữ liệu');
          }
        } catch (error: any) {
          message.error(error.message || 'Lỗi khi xóa dữ liệu');
        } finally {
          setGlobalLoading(false);
        }
      }
    });
  };

  const handleDeleteVideo = (id: bigint) => {
    modal.confirm({
      title: 'Xóa video?',
      content: 'Video này sẽ không còn hiển thị ở mục Gallery.',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        setGlobalLoading(true);
        try {
          const res = await adminFetch('/api/data/media-gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              mediaType: 'video',
              id: id.toString()
            }),
          });
          if (res.ok) {
            await fetchData();
            message.success('Đã xóa video');
          } else {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Lỗi khi xóa dữ liệu');
          }
        } catch (error: any) {
          message.error(error.message || 'Lỗi khi xóa dữ liệu');
        } finally {
          setGlobalLoading(false);
        }
      }
    });
  };

  const toggleStatus = async (id: bigint, type: 'images' | 'videos') => {
    const item = type === 'images' ? images.find(img => img.id === id) : videos.find(v => v.id === id);
    if (!item) return;

    const newStatus = item.status === 'active' ? 'hidden' : 'active';
    setGlobalLoading(true);
    try {
      const res = await adminFetch('/api/data/media-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          mediaType: type === 'images' ? 'image' : 'video',
          id: id.toString(),
          data: { status: newStatus }
        }),
      });
      if (res.ok) {
        await fetchData();
        message.success('Đã cập nhật trạng thái hiển thị');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      setGlobalLoading(true);
      const action = editingId !== null ? 'update' : 'create';
      const mediaType = activeTab === 'images' ? 'image' : 'video';

      try {
        const res = await adminFetch('/api/data/media-gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            mediaType,
            id: editingId?.toString(),
            data: values
          }),
        });

        if (res.ok) {
          await fetchData();
          message.success('Đã lưu dữ liệu thành công');
          setIsModalOpen(false);
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Lỗi khi lưu dữ liệu');
        }
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi lưu dữ liệu');
      } finally {
        setGlobalLoading(false);
      }
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-0"
    >
      <AdminPageHeader
        title="Video & Hình ảnh"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Video & Hình ảnh' },
        ]}
        onSearch={handleSearch}
        primaryAction={{
          label: activeTab === 'images' ? 'Tải lên hình ảnh' : 'Thêm video mới',
          onClick: handleAdd,
          icon: <PlusOutlined />
        }}
      />

      <div className="bg-white overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 rounded-2xl">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className="admin-tabs custom-admin-tabs"
          items={[
            {
              key: 'images',
              label: (
                <span className="flex items-center gap-2 font-semibold px-4 uppercase text-[11px] tracking-wide">
                  <PictureOutlined /> Hình ảnh Gallery
                </span>
              ),
              children: (
                <div className="p-6">
                  <Row gutter={[24, 24]}>
                    {filteredImages.map(img => (
                      <Col xs={24} sm={12} md={8} lg={6} key={img.id}>
                        <Card
                          hoverable
                          cover={
                            <div className="h-44 overflow-hidden bg-gray-50 flex items-center justify-center relative group">
                              <img alt={img.title} src={img.url} className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${img.status === 'hidden' ? 'opacity-40 grayscale' : ''}`} />
                              <div className="absolute inset-0 bg-binovet-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                <Button shape="circle" size="large" icon={<EyeOutlined />} onClick={() => handleView(img.url)} className="border-none shadow-lg" />
                                <Button shape="circle" size="large" icon={<EditOutlined />} onClick={() => handleEdit(img)} className="border-none shadow-lg text-blue-500" />
                                <Button shape="circle" size="large" icon={<DeleteOutlined />} danger onClick={() => handleDeleteImage(img.id)} className="border-none shadow-lg" />
                              </div>
                              {img.status === 'hidden' && (
                                <div className="absolute top-4 left-4 z-10">
                                  <Tag color="default" className="m-0 font-semibold text-[9px] uppercase tracking-wide border-none bg-black/50 text-white backdrop-blur-md">ĐANG ẨN</Tag>
                                </div>
                              )}
                              {img.featured && (
                                <div className="absolute top-4 right-4 z-10">
                                  <Tag className="m-0 font-semibold text-[9px] uppercase tracking-wide border-none bg-amber-400 text-white backdrop-blur-md flex items-center gap-1"><StarFilled /> Trang chủ</Tag>
                                </div>
                              )}
                            </div>
                          }
                          className="rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border-gray-100 group"
                          styles={{
                            body: {
                              padding: '16px 20px'
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 mr-2">
                              <h4 className="text-sm font-semibold text-binovet-dark truncate m-0">{img.title}</h4>
                            </div>
                            <Tag className="m-0 text-[10px] font-semibold bg-amber-50 text-amber-600 border-none px-2 py-0.5 rounded-lg">#{img.order || 0}</Tag>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Hiển thị Gallery</span>
                            <Switch size="small" checked={img.status === 'active'} onChange={() => toggleStatus(img.id, 'images')} className="bg-gray-200" />
                          </div>
                        </Card>
                      </Col>
                    ))}
                    {filteredImages.length === 0 && <div className="w-full py-20"><Empty description="Không tìm thấy hình ảnh nào" /></div>}
                  </Row>
                </div>
              )
            },
            {
              key: 'videos',
              label: (
                <span className="flex items-center gap-2 font-semibold px-4 uppercase text-[11px] tracking-wide">
                  <VideoCameraOutlined /> Video Showcase
                </span>
              ),
              children: (
                <div className="p-6">
                  <Row gutter={[24, 24]}>
                    {filteredVideos.map(vid => (
                      <Col xs={24} lg={12} key={vid.id}>
                        <Card
                          hoverable
                          className={`rounded-2xl overflow-hidden border-gray-100 shadow-sm hover:shadow-lg transition-all group ${vid.status === 'hidden' ? 'bg-gray-50' : ''}`}
                          styles={{ body: { padding: 0 } }}
                        >
                          <div className="flex flex-col sm:flex-row h-full">
                            <div className="w-full sm:w-56 h-48 bg-binovet-dark shrink-0 flex items-center justify-center relative overflow-hidden group">
                              <img src={vid.thumbnail || null} className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${vid.status === 'hidden' ? 'opacity-20 grayscale' : 'opacity-60'}`} />
                              <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl group-hover:scale-110 group-hover:bg-primary transition-all shadow-xl">
                                <PlayCircleOutlined />
                              </div>
                              {vid.status === 'hidden' && (
                                <div className="absolute top-4 left-4 z-20">
                                  <Tag color="default" className="m-0 font-semibold text-[9px] uppercase tracking-wide border-none bg-black/50 text-white backdrop-blur-md">ĐANG ẨN</Tag>
                                </div>
                              )}
                              {vid.featured && (
                                <div className="absolute top-4 right-4 z-20">
                                  <Tag className="m-0 font-semibold text-[9px] uppercase tracking-wide border-none bg-amber-400 text-white backdrop-blur-md flex items-center gap-1"><StarFilled /> Trang chủ</Tag>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col justify-between p-6">
                              <div>
                                <div className="flex justify-between items-start gap-4 mb-4">
                                  <h4 className={`font-semibold text-binovet-dark text-lg leading-tight ${vid.status === 'hidden' ? 'text-gray-400' : ''}`}>{vid.title}</h4>
                                  <Tag className="m-0 text-[10px] font-semibold bg-amber-50 text-amber-600 border-none px-2 py-0.5 rounded-lg shrink-0">#{vid.order || 0}</Tag>
                                </div>
                                <code className="text-[10px] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 block truncate w-full mb-6">
                                  {vid.url}
                                </code>
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <Space>
                                  <Tooltip title="Xem thử">
                                    <Button size="small" icon={<EyeOutlined />} onClick={() => handleVideoPreview(vid.url)} className="rounded-xl border-gray-200 h-9 px-4 text-xs font-bold" />
                                  </Tooltip>
                                  <Tooltip title="Chỉnh sửa">
                                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(vid)} className="rounded-xl border-gray-200 h-9 px-4 text-xs font-bold text-blue-500" />
                                  </Tooltip>
                                  <Tooltip title="Xóa">
                                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteVideo(vid.id)} className="rounded-xl border-gray-200 h-9 px-4 text-xs font-bold" />
                                  </Tooltip>
                                </Space>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-semibold text-gray-400 tracking-wide uppercase">HIỂN THỊ</span>
                                  <Switch size="small" checked={vid.status === 'active'} onChange={() => toggleStatus(vid.id, 'videos')} className="bg-gray-200" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                    {filteredVideos.length === 0 && <div className="w-full py-20"><Empty description="Không tìm thấy video nào" /></div>}
                  </Row>
                </div>
              )
            }
          ]}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              {editingId ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <span className="text-2xl font-semibold tracking-tight text-[#0c2236]">
              {editingId ? (activeTab === 'images' ? 'Cập nhật hình ảnh' : 'Cập nhật video') : (activeTab === 'images' ? 'Thêm hình ảnh Gallery' : 'Thêm video mới')}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu dữ liệu"
        cancelText="Bỏ qua"
        width={750}
        styles={{
          body: {
            maxHeight: '80vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          },
        }}
        centered
        okButtonProps={{ className: "rounded-xl h-11 px-8 font-semibold uppercase tracking-wide text-[11px] border-none shadow-lg shadow-primary/20" }}
        cancelButtonProps={{ className: "rounded-xl h-11 px-8 font-semibold uppercase tracking-wide text-[11px]" }}
      >
        <Form form={form} layout="vertical" className="mt-6 px-4">
          <Row gutter={24}>
            <Col span={14}>
              <Form.Item name="title" label="Tiêu đề / Chú thích" rules={[{ required: true, message: 'Hãy nhập thông tin cho trường Tiêu đề / Ghi chú' }]}>
                <Input placeholder="Nhập tiêu đề cho item này..." className="rounded-xl py-2 px-4 font-bold" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="Trạng thái" initialValue="active">
                <Select className="w-full" options={[
                  { label: 'Đang hiển thị', value: 'active' },
                  { label: 'Đang ẩn', value: 'hidden' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="order" label="Thứ tự" initialValue={0}>
                <Input type="number" className="rounded-xl py-2 px-4 text-center font-bold" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="featured"
            label="Nổi bật"
            valuePropName="checked"
            initialValue={false}
            tooltip="Ảnh/video sẽ hiển thị trong trang Thư viện. Bật Nổi bật để ưu tiên hiển thị lên đầu."
          >
            <Switch checkedChildren="Nổi bật" unCheckedChildren="Thường" />
          </Form.Item>

          {activeTab === 'images' ? (
            <Form.Item name="url" label="Hình ảnh Gallery" rules={[{ required: true, message: 'Vui lòng tải ảnh lên' }]}>
              <ImageUpload label="Tải ảnh Gallery lên" aspectRatio="16/9" />
            </Form.Item>
          ) : (
            <>
              <Form.Item label="Link Video hoặc Tải lên tập tin" required rules={[{ required: true, message: 'Vui lòng cung cấp link video hoặc tải lên' }]}>
                <div className="space-y-4">
                  <Form.Item name="url" noStyle>
                    <Input
                      placeholder="Dán link video (YouTube, MP4...) tại đây"
                      prefix={<PlayCircleOutlined className="text-red-500" />}
                      className="rounded-xl py-2 px-4 mb-2"
                    />
                  </Form.Item>
                  <Form.Item name="url" noStyle>
                    <VideoUpload label="Hoặc nhấn vào đây để tải video lên" />
                  </Form.Item>
                </div>
              </Form.Item>
              <Form.Item name="thumbnail" label="Ảnh đại diện Video (Thumbnail)">
                <ImageUpload label="Tải thumbnail lên" aspectRatio="16/9" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <div style={{ display: 'none' }}>
        <Image.PreviewGroup preview={{ open: previewOpen, onOpenChange: (vis) => setPreviewOpen(vis) }}>
          {previewImage ? <Image src={previewImage} /> : null}
        </Image.PreviewGroup>
      </div>
    </motion.div>
  );
}


export default function AdminMediaGalleryPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <AdminMediaGalleryPageContent />
    </React.Suspense>
  );
}
