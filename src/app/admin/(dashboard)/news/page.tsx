"use client";

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Table, Button, Space, Tag, Input, Modal, Form, Switch, Checkbox, Tooltip, Row, Col, App, DatePicker, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, CheckCircleOutlined, FormOutlined, StarOutlined } from '@ant-design/icons';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatCard from '@/components/admin/AdminStatCard';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { motion } from 'framer-motion';
import { adminFetch } from '@/lib/api';
import { Article, ArticleSummary } from '@/types';
import CKEditor from '@/components/admin/CKEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

function AdminNewsPageContent() {
  const { modal, message } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [allArticles, setAllArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<ArticleSummary | null>(null);
  const [form] = Form.useForm();

  // Load data from API
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/data/articles?summary=1');
      const data = await res.json();
      setAllArticles(data || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [message]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived news list
  const news = useMemo(() => {
    return allArticles.filter((a) => a.category === 'tin-noi-bo' || a.category === 'tin-nganh');
  }, [allArticles]);

  // Summary metrics (shown as stat cards)
  const stats = useMemo(() => ({
    total: news.length,
    published: news.filter((n) => !n.isDraft).length,
    draft: news.filter((n) => n.isDraft).length,
    featured: news.filter((n) => n.featured).length,
  }), [news]);

  // Derived filtered data
  const filteredData = useMemo(() => {
    return news.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [news, query]);

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
      title: 'Bài viết',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shrink-0 shadow-sm group-hover:shadow-md transition-all">
            <img src={record.thumbnail} alt={text} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-binovet-dark text-sm line-clamp-1">{text}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{record.publishDate}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Nổi bật',
      key: 'featured',
      render: (_: any, record: ArticleSummary) => (
        <Switch
          checked={!!record.featured}
          size="small"
          onChange={(checked) => handleToggleFeatured(record, checked)}
        />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isDraft',
      render: (_: any, record: ArticleSummary) => (
        record.isDraft
          ? <Tag color="default" className="font-bold px-3 py-0.5 rounded-full uppercase text-[10px]">Bản nháp</Tag>
          : <Tag color="green" className="font-bold px-3 py-0.5 rounded-full uppercase text-[10px]">Đã đăng</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
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
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleToggleFeatured = async (record: ArticleSummary, checked: boolean) => {
    setAllArticles((prev) => prev.map((a) => (a.id === record.id ? { ...a, featured: checked } : a)));
    try {
      const res = await adminFetch('/api/data/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: { featured: checked },
          id: record.id.toString(),
        }),
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật');
      message.success(checked ? 'Đã bật nổi bật' : 'Đã tắt nổi bật');
    } catch (error: any) {
      setAllArticles((prev) => prev.map((a) => (a.id === record.id ? { ...a, featured: !checked } : a)));
      message.error(error.message || 'Lỗi khi cập nhật');
    }
  };

  const handleEdit = async (record: ArticleSummary) => {
    setEditingNews(record);
    setIsModalOpen(true);
    form.resetFields();
    try {
      const res = await adminFetch(`/api/data/articles?id=${record.id}`);
      if (!res.ok) throw new Error('Không thể tải chi tiết bài viết');
      const full: Article = await res.json();
      form.setFieldsValue({
        ...full,
        publishDate: full.publishDate ? dayjs(full.publishDate, 'DD/MM/YYYY') : dayjs(),
      });
    } catch (error: any) {
      message.error(error.message || 'Không thể tải chi tiết bài viết');
    }
  };

  const handleDelete = (id: bigint) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài viết này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setGlobalLoading(true);
        try {
          const res = await adminFetch('/api/data/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'delete',
              id: id.toString()
            }),
          });
          if (res.ok) {
            await fetchData();
            message.success('Đã xóa bài viết thành công');
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

  const handleAdd = () => {
    setEditingNews(null);
    form.resetFields();
    form.setFieldsValue({
      publishDate: dayjs(),
    });
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      const formattedValues = {
        ...values,
        publishDate: values.publishDate ? values.publishDate.format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY'),
      };

      const action = editingNews ? 'update' : 'create';

      // Save to API
      setGlobalLoading(true);
      try {
        const res = await adminFetch('/api/data/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            data: {
              ...formattedValues,
              slug: values.slug || values.title.toLowerCase().replaceAll(' ', '-').replaceAll(/[^\w-]/g, ''),
            },
            id: editingNews?.id.toString()
          }),
        });

        if (res.ok) {
          await fetchData();
          message.success(editingNews ? 'Cập nhật thành công' : 'Thêm mới thành công');
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
        title="Quản lý Tin tức"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Quản lý Tin tức' },
        ]}
        onSearch={(val) => updateUrl({ q: val })}
        primaryAction={{
          label: 'Thêm tin tức mới',
          onClick: handleAdd,
          icon: <PlusOutlined />
        }}
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <AdminStatCard
            index={0}
            label="Tổng bài viết"
            value={stats.total}
            valueColor="#0a4d8c"
            tileBg="#eaf1f9"
            icon={<FileTextOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AdminStatCard
            index={1}
            label="Đã đăng"
            value={stats.published}
            valueColor="#16a34a"
            tileBg="#e7f6ec"
            icon={<CheckCircleOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AdminStatCard
            index={2}
            label="Bản nháp"
            value={stats.draft}
            valueColor="#64748b"
            tileBg="#eef2f6"
            icon={<FormOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AdminStatCard
            index={3}
            label="Nổi bật"
            value={stats.featured}
            valueColor="#d9531f"
            tileBg="#f9ece4"
            icon={<StarOutlined />}
          />
        </Col>
      </Row>

      <div className="bg-white overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 rounded-2xl">
        <Table size="small" sticky
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 8,
            className: "p-6 border-t border-gray-50",
            onChange: (p) => updateUrl({ page: p })
          }}
          className="admin-table"
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              {editingNews ? <EditOutlined /> : <PlusOutlined />}
            </div>
            <span className="text-2xl font-semibold tracking-tight text-[#0c2236]">
              {editingNews ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={900}
        styles={{
          body: {
            maxHeight: '80vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          },
        }}
        centered
        okText={editingNews ? "Cập nhật bài viết" : "Thêm mới bài viết"}
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "rounded-xl h-11 px-8 font-semibold uppercase tracking-wide text-[11px] border-none shadow-lg shadow-primary/20" }}
        cancelButtonProps={{ className: "rounded-xl h-11 px-8 font-semibold uppercase tracking-wide text-[11px]" }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-6 px-4"
        >
          {/* News is a single flat section now — no internal/industry split.
              Category is fixed so the public feed keeps picking the article up. */}
          <Form.Item name="category" initialValue="tin-noi-bo" hidden>
            <Input />
          </Form.Item>
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                name="publishDate"
                label="Ngày đăng bài"
                rules={[{ required: true, message: 'Vui lòng chọn ngày đăng' }]}
              >
                <DatePicker className="w-full rounded-xl" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="featured"
                label="Nổi bật"
                initialValue={false}
                valuePropName="checked"
              >
                <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="thumbnail"
            label="Hình ảnh bài viết"
          >
            <ImageUpload label="Chọn ảnh đại diện" aspectRatio="16/9" />
          </Form.Item>

          <Tabs
            items={[
              {
                key: 'vi',
                label: '🇻🇳 Tiếng Việt',
                forceRender: true,
                children: (
                  <>
                    <Form.Item
                      name="title"
                      label="Tiêu đề bài viết"
                      rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                      <Input className="rounded-xl py-2 font-bold" placeholder="Nhập tiêu đề tin tức..." />
                    </Form.Item>

                    <Form.Item
                      name="excerpt"
                      label="Mô tả ngắn (Trích dẫn)"
                    >
                      <Input.TextArea rows={3} className="rounded-xl p-3" placeholder="Nhập đoạn mô tả ngắn cho bài viết..." />
                    </Form.Item>

                    <Form.Item
                      name="content"
                      label="Nội dung chi tiết"
                    >
                      <CKEditor placeholder="Nhập nội dung chi tiết bài viết..." />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'en',
                label: '🇬🇧 English',
                forceRender: true,
                children: (
                  <>
                    <Form.Item
                      name="titleEn"
                      label="Tiêu đề (EN)"
                    >
                      <Input className="rounded-xl py-2 font-bold" placeholder="English title..." />
                    </Form.Item>

                    <Form.Item
                      name="excerptEn"
                      label="Mô tả ngắn (EN)"
                    >
                      <Input.TextArea rows={3} className="rounded-xl p-3" placeholder="Short English excerpt..." />
                    </Form.Item>

                    <Form.Item
                      name="contentEn"
                      label="Nội dung (EN)"
                    >
                      <CKEditor placeholder="Start writing the English content..." />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />

          <Form.Item name="isDraft" valuePropName="checked" initialValue={false}>
            <Checkbox>Lưu nháp (không hiển thị ở trang người dùng)</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
}


export default function AdminNewsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <AdminNewsPageContent />
    </React.Suspense>
  );
}
