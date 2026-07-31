"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Table, Button, Space, Tag, Input, Modal, Form, Select, Tooltip, App, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTableFilterBar from '@/components/admin/AdminTableFilterBar';
import { motion } from 'framer-motion';
import { uploadFile } from '@/lib/storage-provider';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

export interface Catalogue {
  id?: number;
  title: string;
  titleEn?: string | null;
  size: string;
  type: string;
  link: string;
  created_at?: string;
}

function AdminCatalogueContent() {
  const { modal, message } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const filterType = searchParams.get('type') || '';
  const page = Number.parseInt(searchParams.get('page') || '1', 10);

  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Catalogue | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  const fetchCatalogues = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/catalogues');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setCatalogues(data || []);
    } catch (error: any) {
      console.error(error);
      message.error('Không thể tải dữ liệu catalogue');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchCatalogues();
  }, [fetchCatalogues]);

  const filteredData = catalogues.filter((item) => {
    const searchTerm = query.toLowerCase();
    const title = (item.title || '').toLowerCase();
    const titleEn = (item.titleEn || '').toLowerCase();
    const matchesQuery = !searchTerm || title.includes(searchTerm) || titleEn.includes(searchTerm);
    const matchesType = !filterType || item.type === filterType;
    return matchesQuery && matchesType;
  });

  const typeOptions = Array.from(new Set(catalogues.map((item) => item.type).filter(Boolean))).map((value) => ({
    label: value.toUpperCase(),
    value,
  }));

  const updateUrl = (params: Record<string, string | number | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    let resetPage = false;

    Object.entries(params).forEach(([key, value]) => {
      if (key === 'page') {
        newSearchParams.set('page', String(value));
      } else {
        if (value !== undefined && value !== '') newSearchParams.set(key, String(value));
        else newSearchParams.delete(key);
        resetPage = true;
      }
    });

    if (resetPage) newSearchParams.set('page', '1');
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const columns = [
    {
      title: 'Tên tài liệu',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <div className="font-bold text-biotechvet-dark text-sm">{text}</div>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag className="font-black px-3 py-1 rounded-lg uppercase text-[10px] tracking-wider">{type}</Tag>,
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Liên kết',
      dataIndex: 'link',
      key: 'link',
      render: (link: string) => (
        <a href={link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline line-clamp-1 max-w-[200px]">
          {link}
        </a>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: Catalogue) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              type="text"
              className="text-blue-500 hover:bg-blue-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              type="text"
              danger
              className="hover:bg-red-50 w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: Catalogue) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      titleEn: record.titleEn || '',
    });
    setFileList(record.link ? [{ uid: '-1', name: 'Tệp hiện tại', status: 'done', url: record.link }] : []);
    setIsModalOpen(true);
  };

  const handleDelete = (record: Catalogue) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa "${record.title}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setGlobalLoading(true);
        try {
          const response = await fetch(`/api/admin/catalogues/${record.id}`, { method: 'DELETE' });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          await fetchCatalogues();
          message.success('Xóa catalogue thành công');
        } catch (error) {
          console.error(error);
          message.error('Xóa catalogue thất bại');
        } finally {
          setGlobalLoading(false);
        }
      },
    });
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ type: 'PDF', titleEn: '' });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleUploadFile = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    setUploading(true);
    setGlobalLoading(true);
    try {
      const url = await uploadFile(file as File, 'catalogues', onProgress);
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      form.setFieldsValue({
        link: url,
        size: `${sizeInMB} MB`,
      });
      onSuccess?.(url);
      message.success('Tải tệp lên thành công');
    } catch (error) {
      console.error(error);
      onError?.(error);
      message.error('Tải tệp lên thất bại');
    } finally {
      setUploading(false);
      setGlobalLoading(false);
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      setGlobalLoading(true);
      try {
        if (editingItem?.id) {
          const response = await fetch(`/api/admin/catalogues/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          message.success('Cập nhật catalogue thành công');
        } else {
          const response = await fetch('/api/admin/catalogues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          message.success('Thêm catalogue thành công');
        }

        setIsModalOpen(false);
        await fetchCatalogues();
      } catch (error) {
        console.error(error);
        message.error('Lưu catalogue thất bại');
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
        title="Quản lý Catalogue"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Catalogue' },
        ]}
        onSearch={(val) => updateUrl({ q: val })}
        primaryAction={{
          label: 'Thêm mới',
          onClick: handleAdd,
          icon: <PlusOutlined />,
        }}
      />

      <AdminTableFilterBar
        search={{
          placeholder: 'Tìm kiếm tên catalogue',
          defaultValue: query,
        }}
        onChange={(patch) => updateUrl(patch)}
        filters={[
          {
            key: 'type',
            placeholder: 'Loại tài liệu',
            width: 160,
            options: typeOptions,
            value: filterType,
          },
        ]}
      />

      <div className="bg-white overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100" style={{ borderRadius: '3px 3px 32px 32px' }}>
        <Table
          size="small"
          sticky
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 10,
            className: 'p-6 border-t border-gray-50',
            onChange: (nextPage) => updateUrl({ page: nextPage }),
          }}
          className="admin-table"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              {editingItem ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <span className="text-2xl font-black uppercase italic tracking-tighter text-biotechvet-dark">
              {editingItem ? 'Cập nhật catalogue' : 'Thêm catalogue mới'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        centered
        okText={editingItem ? 'Lưu thay đổi' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{ className: 'rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-[11px] border-none shadow-lg shadow-primary/20', disabled: uploading }}
        cancelButtonProps={{ className: 'rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-[11px]' }}
      >
        <Form form={form} layout="vertical" className="mt-6 px-4">
          <Form.Item name="title" label="Tên tài liệu (VI)" rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu tiếng Việt' }]}>
            <Input className="rounded-xl py-2 font-bold" placeholder="VD: Catalogue sản phẩm biotechvet 2026" />
          </Form.Item>

          <Form.Item name="titleEn" label="Tên tài liệu (EN)">
            <Input className="rounded-xl py-2 font-bold" placeholder="Catalogue title in English..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="type" label="Loại tài liệu" rules={[{ required: true, message: 'Vui lòng chọn loại tài liệu' }]}>
              <Select
                className="w-full"
                placeholder="Chọn loại"
                options={[
                  { value: 'PDF', label: 'PDF' },
                  { value: 'DOCX', label: 'DOCX' },
                  { value: 'XLSX', label: 'XLSX' },
                ]}
              />
            </Form.Item>

            <Form.Item name="size" label="Kích thước" rules={[{ required: true, message: 'Vui lòng nhập kích thước' }]}>
              <Input className="rounded-xl py-2" placeholder="VD: 2.4 MB" />
            </Form.Item>
          </div>

          <Form.Item label="Tải lên tệp">
            <Upload customRequest={handleUploadFile} fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} maxCount={1}>
              <Button icon={<UploadOutlined />} loading={uploading}>Chọn tệp</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="link" label="Đường dẫn" rules={[{ required: true, message: 'Vui lòng nhập đường dẫn tệp' }]}>
            <Input className="rounded-xl py-2" placeholder="https://... hoặc /uploads/..." />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}

export default function AdminCataloguePage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <AdminCatalogueContent />
    </React.Suspense>
  );
}
