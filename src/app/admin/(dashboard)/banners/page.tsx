"use client";

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Table, Button, Space, Modal, Form, Input, Upload, Switch, Tooltip, Row, Col, App } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  PictureOutlined, ArrowUpOutlined, ArrowDownOutlined,
  SearchOutlined, LinkOutlined
} from '@ant-design/icons';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ImageUpload from '@/components/admin/ImageUpload';
import { motion } from 'framer-motion';
import { adminFetch } from '@/lib/api';
import { Banner } from '@/types';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

// import { initialBanners } from '@/lib/data'; // Removed static data

function AdminBannersPageContent() {
  const { modal, message } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form] = Form.useForm();

  // Load data from API
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/data/banners');
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [message]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived filtered data
  const filteredData = useMemo(() => {
    return banners
      .filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.link.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => a.order - b.order);
  }, [banners, query]);

  const updateUrl = (params: { q?: string; page?: number }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (params.q !== undefined) {
      if (params.q) newSearchParams.set('q', params.q);
      else newSearchParams.delete('q');
      newSearchParams.set('page', '1'); // Reset to page 1 on search
    }

    if (params.page !== undefined) {
      newSearchParams.set('page', params.page.toString());
    }

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const columns = [
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      render: (order: number) => <span className="font-semibold text-gray-400 text-xs">#{order}</span>
    },
    {
      title: 'Preview',
      dataIndex: 'image',
      key: 'image',
      width: 160,
      render: (text: string) => (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-1 overflow-hidden shadow-sm aspect-[2/1] flex items-center justify-center">
          <img src={text} alt="banner" className="w-full h-full object-cover rounded-lg" />
        </div>
      ),
    },
    {
      title: 'Tên Banner / Ghi chú',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-semibold text-binovet-dark text-sm">{text}</span>
    },
    {
      title: 'Kích thước',
      dataIndex: 'imageSize',
      key: 'imageSize',
      width: 100,
      render: (size: number) => size ? (
        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {(size / 1024).toFixed(0)} KB
        </span>
      ) : <span className="text-[10px] text-gray-300">-</span>
    },
    {
      title: 'Link',
      dataIndex: 'link',
      key: 'link',
      render: (link: string) => (
        <code className="text-[10px] text-primary bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 font-bold flex items-center gap-2 w-fit">
          <LinkOutlined /> {link}
        </code>
      )
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: boolean) => <Switch checked={status} size="small" className="bg-gray-200" />,
    },
    {
      title: 'Actions',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: Banner) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="text"
              className="text-blue-500 hover:bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <div className="flex flex-col gap-1">
            <Button icon={<ArrowUpOutlined className="text-[10px]" />} size="small" className="h-4 w-6 p-0 text-gray-400 hover:text-primary" />
            <Button icon={<ArrowDownOutlined className="text-[10px]" />} size="small" className="h-4 w-6 p-0 text-gray-400 hover:text-primary" />
          </div>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              type="text"
              danger
              className="hover:bg-red-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: Banner) => {
    setEditingBanner(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: bigint) => {
    modal.confirm({
      title: 'Xóa banner',
      content: 'Bạn có chắc muốn xóa banner này?',
      okText: 'Xóa ngay',
      okType: 'danger',
      onOk: async () => {
        setGlobalLoading(true);
        try {
          const res = await adminFetch('/api/data/banners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              id: id.toString()
            }),
          });
          if (res.ok) {
            await fetchData();
            message.success('Đã xóa thành công');
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

  const handleAdd = () => {
    setEditingBanner(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      const action = editingBanner ? 'update' : 'create';

      // Save to API
      setGlobalLoading(true);
      try {
        const res = await adminFetch('/api/data/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            data: {
              ...values,
              order: values.order !== undefined && values.order !== '' ? Number(values.order) : banners.length + 1,
            },
            id: editingBanner?.id.toString()
          }),
        });
        if (res.ok) {
          await fetchData();
          message.success(editingBanner ? 'Đã cập nhật banner' : 'Đã thêm banner mới');
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
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-0"
    >
      <AdminPageHeader
        title="Banner Slider"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Banner / Slider' },
        ]}
        onSearch={(val) => updateUrl({ q: val })}
        primaryAction={{
          label: 'Tải lên Banner',
          onClick: handleAdd,
          icon: <PlusOutlined />
        }}
      />

      <div className="bg-white overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 rounded-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 shadow-sm">
            <PictureOutlined className="text-xl" />
            <div className="text-xs font-bold leading-relaxed">
              <span className="uppercase tracking-wide block mb-1 opacity-70">Gợi ý kỹ thuật:</span>
              Kích thước banner tối ưu cho trang chủ là <span className="text-primary font-black">1920x800 pixel</span>. Hãy đảm bảo hình ảnh có độ phân giải cao để hiển thị tốt nhất trên màn hình lớn.
            </div>
          </div>

          <Table size="small" sticky
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            className="admin-table"
            pagination={{
              current: page,
              pageSize: 5,
              className: "p-6 border-t border-gray-50",
              onChange: (p) => updateUrl({ page: p })
            }}
          />
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              {editingBanner ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <span className="text-2xl font-semibold tracking-tight text-[#0c2236]">
              {editingBanner ? 'Cập nhật Banner' : 'Tải lên Banner mới'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu dữ liệu"
        cancelText="Hủy bỏ"
        width={700}
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
          <Form.Item name="imageSize" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="image" label="Hình ảnh Banner" rules={[{ required: true }]}>
            <ImageUpload
              label="Tải lên Banner"
              aspectRatio="1920/800"
              maxWidth={1920}
              maxHeight={800}
              onFileChange={(file) => {
                form.setFieldsValue({ imageSize: file.size });
              }}
              maxSize={40}
            />
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề / Ghi chú" rules={[{ required: true }]}>
            <Input className="rounded-xl py-2 font-bold" placeholder="Ghi chú tên banner để dễ quản lý..." />
          </Form.Item>

          <Form.Item name="titleEn" label="Tiêu đề (EN)">
            <Input className="rounded-xl py-2 font-bold" placeholder="Banner title in English..." />
          </Form.Item>

          <Form.Item name="link" label="Đường dẫn điều hướng (URL)" initialValue="/">
            <Input className="rounded-xl py-2" placeholder="VD: /san-pham hoặc https://..." />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái hiển thị" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="order" label="Thứ tự">
                <Input type="number" className="rounded-xl" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </motion.div>
  );
}


export default function AdminBannersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <AdminBannersPageContent />
    </React.Suspense>
  );
}
