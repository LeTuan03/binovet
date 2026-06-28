"use client";

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Table, Button, Space, Modal, Form, Input, Tooltip, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { motion } from 'framer-motion';
import { adminFetch } from '@/lib/api';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

function CategoryManagementContent() {
  const { modal, message } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // Load data from API
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const catRes = await adminFetch('/api/data/categories');
      const catData = await catRes.json();
      setCategories(catData);
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
  const filteredCategories = useMemo(() => {
    return categories.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.slug.toLowerCase().includes(query.toLowerCase())
    );
  }, [categories, query]);

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

  const showModal = (record?: any) => {
    if (record) {
      setEditingItem(record);
      form.setFieldsValue(record);
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const action = editingItem ? 'update' : 'create';

      // Save to API
      setGlobalLoading(true);
      try {
        const res = await adminFetch('/api/data/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            data: {
              ...values,
              slug: values.slug || values.name.toLowerCase().replaceAll(' ', '-').replaceAll(/[^\w-]/g, ''),
            },
            id: editingItem?.id
          }),
        });

        if (res.ok) {
          await fetchData();
          message.success(editingItem ? 'Cập nhật thành công' : 'Thêm mới thành công');
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

  const handleDelete = (id: number) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Việc xóa danh mục này có thể ảnh hưởng đến hiển thị của các sản phẩm liên quan. Bạn có chắc chắn?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        setGlobalLoading(true);
        try {
          const res = await adminFetch('/api/data/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              id: id
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
      },
    });
  };

  const categoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <span className="font-bold text-gray-400 text-xs">#{id}</span>
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold text-binovet-dark">{text}</span>
    },
    {
      title: 'Tên danh mục (EN)',
      dataIndex: 'nameEn',
      key: 'nameEn',
      render: (text: string) => <span className="text-gray-500">{text || <span className="text-gray-300 italic">—</span>}</span>
    },
    {
      title: 'Slug (URL)',
      dataIndex: 'slug',
      key: 'slug',
      render: (text: string) => <code className="text-[10px] text-primary bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 font-bold">{text}</code>
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} type="text" onClick={() => showModal(record)} className="text-blue-500 hover:bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all" />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button icon={<DeleteOutlined />} type="text" danger onClick={() => handleDelete(record.id)} className="hover:bg-red-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-0"
    >
      <AdminPageHeader
        title="Danh mục sản phẩm"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Danh mục' },
        ]}
        onSearch={(val) => updateUrl({ q: val })}
        primaryAction={{
          label: 'Thêm Danh mục',
          onClick: () => showModal(),
          icon: <PlusOutlined />
        }}
      />

      <div className="bg-white overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 rounded-2xl">
        <Table size="small" sticky
          columns={categoryColumns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={loading}
          className="admin-table"
          pagination={{
            current: page,
            pageSize: 10,
            className: "p-6 border-t border-gray-50",
            onChange: (p) => updateUrl({ page: p })
          }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              {editingItem ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <span className="text-2xl font-semibold tracking-tight text-[#0c2236]">
              {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} Danh mục
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu dữ liệu"
        cancelText="Hủy bỏ"
        width={600}
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
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input className="rounded-xl py-3 px-4 font-bold" placeholder="Ví dụ: Thuốc tiêm, Thuốc bột..." />
          </Form.Item>
          <Form.Item name="nameEn" label="Tên danh mục (EN)">
            <Input className="rounded-xl py-3 px-4 font-bold" placeholder="Ex: Injectables, Powder medicines..." />
          </Form.Item>
          <Form.Item name="slug" label="Slug (URL - Tùy chọn)" help={<span className="text-[10px] opacity-60 uppercase font-semibold tracking-wide mt-1 inline-block">Để trống hệ thống sẽ tự sinh dựa trên tên gọi.</span>}>
            <Input className="rounded-xl py-2 px-4" placeholder="thuoc-tiem" />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}


export default function CategoryManagement() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <CategoryManagementContent />
    </React.Suspense>
  );
}
