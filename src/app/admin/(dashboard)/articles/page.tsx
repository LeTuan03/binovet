"use client";

import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, Tooltip, Row, Col, Divider, Breadcrumb, DatePicker, Switch, Checkbox, App, Tabs } from 'antd';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileImageOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
// import { articles, animalTags } from '@/lib/data'; // Removed static imports
import CKEditor from '@/components/admin/CKEditor';
import ImageUpload from '@/components/admin/ImageUpload';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { adminFetch } from '@/lib/api';
import { Article, ArticleSummary } from '@/types';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

function ArticleManagementContent() {
  const { message: msg, modal } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [data, setData] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<bigint | null>(null);

  // Load data from API
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const artRes = await adminFetch('/api/data/articles?summary=1');
      const artData = await artRes.json();
      setData(artData);
    } catch (error) {
      msg.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [msg]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived articles
  const articlesList = useMemo(() => {
    return data.filter((a) => a.category === 'benh-dieu-tri');
  }, [data]);

  // Derived filtered data
  const filteredData = useMemo(() => {
    return articlesList.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [articlesList, query]);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUrl({ q: e.target.value });
  };

  const showModal = async (record?: ArticleSummary) => {
    if (record) {
      setEditingId(record.id);
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
        msg.error(error.message || 'Không thể tải chi tiết bài viết');
      }
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        publishDate: dayjs(),
      });
      setIsModalOpen(true);
    }
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const formattedValues = {
        ...values,
        publishDate: values.publishDate ? values.publishDate.format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY'),
      };

      const action = editingId ? 'update' : 'create';

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
            id: editingId?.toString()
          }),
        });

        if (res.ok) {
          await fetchData();
          msg.success(editingId ? 'Cập nhật bài viết thành công' : 'Thêm bài viết mới thành công');
          setIsModalOpen(false);
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Lỗi khi lưu dữ liệu');
        }
      } catch (error: any) {
        msg.error(error.message || 'Lỗi khi lưu dữ liệu');
      } finally {
        setGlobalLoading(false);
      }
    });
  };

  const handleToggleFeatured = async (record: ArticleSummary, checked: boolean) => {
    setData((prev) => prev.map((a) => (a.id === record.id ? { ...a, featured: checked } : a)));
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
      msg.success(checked ? 'Đã bật nổi bật' : 'Đã tắt nổi bật');
    } catch (error: any) {
      setData((prev) => prev.map((a) => (a.id === record.id ? { ...a, featured: !checked } : a)));
      msg.error(error.message || 'Lỗi khi cập nhật');
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
            msg.success('Đã xóa bài viết');
          } else {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Lỗi khi xóa dữ liệu');
          }
        } catch (error: any) {
          msg.error(error.message || 'Lỗi khi xóa dữ liệu');
        } finally {
          setGlobalLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tiêu đề bài viết',
      dataIndex: 'title',
      key: 'title',
      width: '35%',
      render: (text: string, record: ArticleSummary) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
            <img src={record.thumbnail} alt={text} className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-gray-800 line-clamp-2 leading-tight">{text}</span>
        </div>
      ),
    },
    {
      title: 'Chuyên mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => {
        const colors: any = { 'benh-dieu-tri': 'red', 'cam-nang': 'blue', 'tin-noi-bo': 'green', 'tin-nganh': 'orange' };
        const labels: any = { 'benh-dieu-tri': 'Bệnh học', 'cam-nang': 'Cẩm nang', 'tin-noi-bo': 'Tin nội bộ', 'tin-nganh': 'Tin ngành' };
        return <Tag color={colors[cat] || 'default'} className="font-bold px-3 py-0.5 rounded-full uppercase text-[0.6rem]">{labels[cat] || cat}</Tag>;
      },
    },

    {
      title: 'Ngày đăng',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (d: string) => <span className="font-medium text-gray-400 text-xs uppercase tracking-wide">{d}</span>
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
          ? <Tag color="default" className="font-bold px-3 py-0.5 rounded-full uppercase text-[0.6rem]">Bản nháp</Tag>
          : <Tag color="green" className="font-bold px-3 py-0.5 rounded-full uppercase text-[0.6rem]">Đã đăng</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ArticleSummary) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              type="text"
              className="text-blue-500 hover:bg-blue-50"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              type="text"
              danger
              className="hover:bg-red-50"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];



  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý Bệnh học"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Quản lý Bệnh học' },
        ]}
        onSearch={(val) => updateUrl({ q: val })}
        primaryAction={{
          label: 'Viết bài mới',
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
          pagination={{
            current: page,
            pageSize: 6,
            className: "p-6 border-t border-gray-50",
            onChange: (p) => updateUrl({ page: p })
          }}
        />
      </div>

      <Modal
        title={<span className="text-xl font-semibold text-[#0c2236] tracking-tight">{editingId ? 'Chỉnh sửa Bài viết' : 'Soạn thảo Bài viết mới'}</span>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={1000}
        styles={{
          body: {
            maxHeight: '80vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          },
        }}
        centered
        okText="Lưu bài viết"
        cancelText="Huỷ"
        className="rounded-2xl top-[40px]"
      >
        <Form form={form} layout="vertical" className="mt-8">
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item name="category" label="Chuyên mục" initialValue="benh-dieu-tri" rules={[{ required: true }]}>
                <Select
                  className="rounded-xl"
                  disabled
                  options={[
                    { label: 'Bệnh & Điều trị', value: 'benh-dieu-tri' },
                  ]}
                />
              </Form.Item>
            </Col>

          </Row>

          <Row gutter={24}>
            <Col span={14}>
              <Form.Item name="thumbnail" label="Hình đại diện (Thumbnail)">
                <ImageUpload label="Tải ảnh đại diện" aspectRatio="16/9" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="publishDate" label="Ngày đăng bài">
                <DatePicker className="w-full rounded-xl py-2" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="featured" label="Nổi bật" initialValue={false} valuePropName="checked">
                <Switch checkedChildren="ON" unCheckedChildren="OFF" />
              </Form.Item>
            </Col>
          </Row>

          <Divider><span className="text-[0.6rem] font-semibold text-gray-300 uppercase tracking-wide">Nội dung truyền thông</span></Divider>

          <Tabs
            items={[
              {
                key: 'vi',
                label: '🇻🇳 Tiếng Việt',
                forceRender: true,
                children: (
                  <>
                    <Form.Item name="title" label="Tiêu đề bài viết" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                      <Input placeholder="Tiêu đề bắt mắt..." className="rounded-xl py-3 px-4 font-bold text-lg" />
                    </Form.Item>

                    <Form.Item name="excerpt" label="Tóm tắt ngắn (Excerpt)">
                      <Input.TextArea rows={2} className="rounded-xl p-4 font-medium" placeholder="Viết mô tả ngắn để thu hút người đọc..." />
                    </Form.Item>

                    <Form.Item name="content" label="Nội dung chuyên sâu (Tối ưu SEO - CKEditor)">
                      <CKEditor placeholder="Bắt đầu viết nội dung chuyên sâu..." />
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
                    <Form.Item name="titleEn" label="Tiêu đề (EN)">
                      <Input placeholder="English title..." className="rounded-xl py-3 px-4 font-bold text-lg" />
                    </Form.Item>

                    <Form.Item name="excerptEn" label="Tóm tắt ngắn (EN)">
                      <Input.TextArea rows={2} className="rounded-xl p-4 font-medium" placeholder="Short English excerpt..." />
                    </Form.Item>

                    <Form.Item name="contentEn" label="Nội dung (EN)">
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
    </div>
  );
}


export default function ArticleManagement() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <ArticleManagementContent />
    </React.Suspense>
  );
}
