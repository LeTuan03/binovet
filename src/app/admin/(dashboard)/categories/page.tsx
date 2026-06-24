"use client";

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Table, Button, Space, Modal, Form, Input, Tabs, Tooltip, Row, Col, App } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  AppstoreOutlined, TagsOutlined, SearchOutlined
} from '@ant-design/icons';
// import { categories as initialCategories, animalTags as initialAnimalTags } from '@/lib/data'; // Removed static imports
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { motion } from 'framer-motion';
import { adminFetch } from '@/lib/api';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

function CategoryAndTagManagementContent() {
  const { modal, message } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const activeTab = searchParams.get('tab') || '1';

  const [categories, setCategories] = useState<any[]>([]);
  const [animalTags, setAnimalTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // Load data from API
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, tagRes] = await Promise.all([
        adminFetch('/api/data/categories'),
        adminFetch('/api/data/animal-tags')
      ]);
      const catData = await catRes.json();
      const tagData = await tagRes.json();
      setCategories(catData);
      setAnimalTags(tagData);
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

  const filteredAnimalTags = useMemo(() => {
    return animalTags.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.slug.toLowerCase().includes(query.toLowerCase())
    );
  }, [animalTags, query]);

  const updateUrl = (params: { q?: string; page?: number; tab?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (params.q !== undefined) {
      if (params.q) newSearchParams.set('q', params.q);
      else newSearchParams.delete('q');
      newSearchParams.set('page', '1'); // Reset to page 1 on search
    }

    if (params.page !== undefined) {
      newSearchParams.set('page', params.page.toString());
    }

    if (params.tab !== undefined) {
      newSearchParams.set('tab', params.tab);
      newSearchParams.set('page', '1'); // Reset to page 1 on tab change
    }

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const onTabChange = (key: string) => {
    updateUrl({ tab: key });
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
      const dataType = activeTab === '1' ? 'categories' : 'animal-tags';
      const action = editingItem ? 'update' : 'create';

      // Save to API
      setGlobalLoading(true);
      try {
        const res = await adminFetch(`/api/data/${dataType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            data: {
              ...values,
              slug: values.slug || values.name.toLowerCase().replaceAll(' ', '-').replaceAll(/[^\w-]/g, ''),
              ...(activeTab === '2' ? { icon: values.icon || '🐾' } : {}),
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
      content: 'Việc xóa phân loại này có thể ảnh hưởng đến hiển thị của các sản phẩm/bài viết liên quan. Bạn có chắc chắn?',
      okText: 'Xóa',
      okType: 'danger',
      onOk: async () => {
        const dataType = activeTab === '1' ? 'categories' : 'animal-tags';
        setGlobalLoading(true);
        try {
          const res = await adminFetch(`/api/data/${dataType}`, {
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

  const tagColumns = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      render: (icon: string) => (
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100">
          {icon}
        </div>
      )
    },
    {
      title: 'Tên loài vật',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold text-binovet-dark">{text}</span>
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (text: string) => <code className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-md font-bold">{text}</code>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span className="text-gray-400 text-xs italic">{text || 'Chưa có mô tả...'}</span>
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
        title="Phân loại & Tag"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Phân loại' },
        ]}
        onSearch={(val) => updateUrl({ q: val })}
        primaryAction={{
          label: activeTab === '1' ? 'Thêm Danh mục' : 'Thêm Loài vật',
          onClick: () => showModal(),
          icon: <PlusOutlined />
        }}
      />

      <div className="bg-white overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 rounded-2xl">
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          className="admin-tabs custom-admin-tabs"
          items={[
            {
              key: '1',
              label: <span className="flex items-center gap-2 font-semibold px-4 uppercase text-[11px] tracking-wide"><AppstoreOutlined /> Danh mục Sản phẩm</span>,
              children: (
                <div className="pt-2">
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
              ),
            },
            {
              key: '2',
              label: <span className="flex items-center gap-2 font-semibold px-4 uppercase text-[11px] tracking-wide"><TagsOutlined /> Loài vật (Handbook)</span>,
              children: (
                <div className="pt-2">
                  <Table size="small" sticky
                    columns={tagColumns}
                    dataSource={filteredAnimalTags}
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
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              {editingItem ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <span className="text-2xl font-semibold tracking-tight text-[#0c2236]">
              {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} Phân loại
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
          <Form.Item name="name" label="Tên gọi" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input className="rounded-xl py-3 px-4 font-bold" placeholder="Ví dụ: Gà, Heo, Thuốc bổ..." />
          </Form.Item>
          <Form.Item name="nameEn" label="Tên gọi (EN)">
            <Input className="rounded-xl py-3 px-4 font-bold" placeholder="Ex: Chicken, Pig, Supplements..." />
          </Form.Item>
          <Form.Item name="slug" label="Slug (URL - Tùy chọn)" help={<span className="text-[10px] opacity-60 uppercase font-semibold tracking-wide mt-1 inline-block">Để trống hệ thống sẽ tự sinh dựa trên tên gọi.</span>}>
            <Input className="rounded-xl py-2 px-4" placeholder="vi-du-ga" />
          </Form.Item>
          {activeTab === '2' && (
            <Row gutter={20}>
              <Col span={6}>
                <Form.Item name="icon" label="Biểu tượng" initialValue="🐾">
                  <Input className="rounded-xl py-2 px-4 text-center text-xl h-[48px]" />
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item name="description" label="Mô tả ngắn">
                  <Input.TextArea rows={1} className="rounded-xl p-3 h-[48px]" placeholder="Mô tả cho loài vật này..." />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="descriptionEn" label="Mô tả ngắn (EN)">
                  <Input.TextArea rows={1} className="rounded-xl p-3 h-[48px]" placeholder="Short description for this animal..." />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>
    </motion.div>
  );
}


export default function CategoryAndTagManagement() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <CategoryAndTagManagementContent />
    </React.Suspense>
  );
}
