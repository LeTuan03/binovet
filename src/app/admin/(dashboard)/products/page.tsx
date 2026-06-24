"use client";

import React, { useState, useMemo } from 'react';
import {
  Table, Button, Space, Form,
  Tag, Tooltip, App
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ProductModal from '@/components/admin/ProductModal';
import { motion } from 'framer-motion';
import { adminFetch } from '@/lib/api';
import { Product, ProductSummary, Category } from '@/types';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

function ProductManagementContent() {
  const { modal, message } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [data, setData] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<bigint | null>(null);

  // Load data from API
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        adminFetch('/api/data/products?summary=1'),
        adminFetch('/api/data/categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setData(prodData);
      setCategories(catData);
    } catch (error) {
      console.log(error);
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
    return data.filter(item => {
      const cat = categories.find(c => c.id === item.categoryId);
      return (
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        cat?.name.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [data, categories, query]);

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

  const showModal = async (record?: ProductSummary) => {
    if (record) {
      setEditingId(record.id);
      setIsModalOpen(true);
      form.resetFields();
      try {
        const res = await adminFetch(`/api/data/products?id=${record.id}`);
        if (!res.ok) throw new Error('Không thể tải chi tiết sản phẩm');
        const full: Product = await res.json();
        form.setFieldsValue({
          ...full,
          images: full.images || [],
        });
      } catch (error: any) {
        message.error(error.message || 'Không thể tải chi tiết sản phẩm');
      }
    } else {
      setEditingId(null);
      form.resetFields();
      setIsModalOpen(true);
    }
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const action = editingId ? 'update' : 'create';

      // Save to API
      setGlobalLoading(true);
      try {
        const res = await adminFetch('/api/data/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            data: {
              ...values,
              slug: values.slug || values.name.toLowerCase().replaceAll(' ', '-').replaceAll(/[^\w-]/g, ''),
            },
            id: editingId?.toString()
          }),
        });

        if (res.ok) {
          await fetchData();
          message.success(editingId ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm mới thành công');
          setIsModalOpen(false);
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Lỗi khi lưu dữ liệu');
        }
      } catch (error: any) {
        console.log(error);
        message.error(error.message || 'Lỗi khi lưu dữ liệu');
      } finally {
        setGlobalLoading(false);
      }
    });
  };

  const handleDelete = (id: bigint) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setGlobalLoading(true);
        try {
          const res = await adminFetch('/api/data/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              id: id.toString()
            }),
          });
          if (res.ok) {
            await fetchData();
            message.success('Đã xóa sản phẩm');
          } else {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Lỗi khi xóa dữ liệu');
          }
        } catch (error: any) {
          console.log(error);
          message.error(error.message || 'Lỗi khi xóa dữ liệu');
        } finally {
          setGlobalLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProductSummary) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm group-hover:shadow-md transition-all">
            <img src={record?.image} alt={text} className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <div className="font-bold text-binovet-dark text-sm">{text}</div>
            <div className="flex items-center gap-2 mt-1">
              {record?.featured && <Tag color="gold" className="text-[9px] px-1.5 font-semibold border-none bg-amber-100 text-amber-700 m-0">NỔI BẬT</Tag>}
              {record?.images && record?.images.length > 0 && (
                <Tag className="text-[9px] px-1.5 font-semibold border-none bg-blue-50 text-blue-600 m-0">
                  +{record?.images.length} ảnh
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (id: bigint) => {
        const cat = categories.find((c: Category) => c.id === id);
        return <Tag className="font-semibold px-3 py-1 rounded-lg uppercase text-[10px] border-none bg-emerald-50 text-emerald-700 m-0 tracking-wide shadow-sm">{cat?.name.split(',')[0] || 'Khác'}</Tag>;
      },
    },

    {
      title: 'Thao tác',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: ProductSummary) => (
        <Space size="small">
          <Tooltip title="Xem trang khách">
            <Button
              icon={<EyeOutlined />}
              onClick={() => window.open(`/san-pham/${record.slug}`)}
              type="text"
              className="text-gray-400 hover:text-primary hover:bg-emerald-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="text"
              className="text-blue-500 hover:bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              onClick={() => showModal(record)}
            />
          </Tooltip>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-0"
    >
      <AdminPageHeader
        title="Quản lý Sản phẩm"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Quản lý Sản phẩm' },
        ]}
        onSearch={(val) => updateUrl({ q: val })}
        primaryAction={{
          label: 'Thêm Sản phẩm',
          onClick: () => showModal(),
          icon: <PlusOutlined />
        }}
      />

      <div className="bg-white overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 rounded-2xl">
        <Table size="small" sticky
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          className="admin-table"
          onChange={(pag) => {
            if (pag.current && pag.current !== page) updateUrl({ page: pag.current });
          }}
          pagination={{
            current: page,
            pageSize: 10,
            className: "p-6 border-t border-gray-50",
            showSizeChanger: false,
          }}
        />
      </div>

      {isModalOpen && <ProductModal
        open={isModalOpen}
        editingId={editingId}
        form={form}
        categories={categories}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      />}
    </motion.div>
  );
}


export default function ProductManagement() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <ProductManagementContent />
    </React.Suspense>
  );
}
