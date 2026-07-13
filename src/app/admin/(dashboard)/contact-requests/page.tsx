"use client";

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Table, Button, Space, Tag, Modal, Tooltip, Descriptions, App } from 'antd';
import {
  EyeOutlined, DeleteOutlined, CheckCircleOutlined, UndoOutlined,
  MailOutlined, PhoneOutlined, UserOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { adminFetch } from '@/lib/api';
import { ContactRequest } from '@/types';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

function AdminContactRequestsPageContent() {
  const { modal, message } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/data/contact-requests');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [message]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    const q = query.toLowerCase();
    return requests.filter(item =>
      item.fullName.toLowerCase().includes(q) ||
      item.phoneNumber.toLowerCase().includes(q) ||
      (item.emailAddress || '').toLowerCase().includes(q) ||
      item.messageBox.toLowerCase().includes(q)
    );
  }, [requests, query]);

  const newCount = useMemo(() => requests.filter(r => r.status === 'new').length, [requests]);

  const updateUrl = (params: { q?: string; page?: number }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (params.q !== undefined) {
      if (params.q) newSearchParams.set('q', params.q);
      else newSearchParams.delete('q');
      newSearchParams.set('page', '1');
    }
    if (params.page !== undefined) {
      newSearchParams.set('page', params.page.toString());
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const showDetail = (record: ContactRequest) => {
    setSelected(record);
    setIsModalOpen(true);
  };

  const updateStatus = async (record: ContactRequest, status: string) => {
    setGlobalLoading(true);
    try {
      const res = await adminFetch('/api/data/contact-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: record.id.toString(), data: { status } }),
      });
      if (res.ok) {
        setRequests(prev => prev.map(r => (r.id === record.id ? { ...r, status } : r)));
        setSelected(prev => (prev && prev.id === record.id ? { ...prev, status } : prev));
        message.success(status === 'handled' ? 'Đã đánh dấu xử lý' : 'Đã chuyển về trạng thái Mới');
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi khi cập nhật trạng thái');
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDelete = (record: ContactRequest) => {
    modal.confirm({
      title: 'Xóa yêu cầu liên hệ',
      content: `Bạn có chắc muốn xóa yêu cầu từ "${record.fullName}"?`,
      okText: 'Xóa ngay',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        setGlobalLoading(true);
        try {
          const res = await adminFetch('/api/data/contact-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: record.id.toString() }),
          });
          if (res.ok) {
            setRequests(prev => prev.filter(r => r.id !== record.id));
            message.success('Đã xóa yêu cầu');
          } else {
            const err = await res.json();
            throw new Error(err.error || 'Lỗi khi xóa dữ liệu');
          }
        } catch (error: any) {
          message.error(error.message || 'Lỗi khi xóa dữ liệu');
        } finally {
          setGlobalLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Người gửi',
      key: 'sender',
      render: (_: any, record: ContactRequest) => (
        <div>
          <div className="flex items-center gap-2 font-semibold text-[#0c2236]">
            {record.status === 'new' && <span className="inline-block w-2 h-2 rounded-full bg-[#d9531f]" />}
            {record.fullName}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[#94a3b8] mt-1">
            <span className="flex items-center gap-1"><PhoneOutlined /> {record.phoneNumber}</span>
            {record.emailAddress && <span className="flex items-center gap-1"><MailOutlined /> {record.emailAddress}</span>}
          </div>
        </div>
      ),
    },
    {
      title: 'Nội dung yêu cầu',
      dataIndex: 'messageBox',
      key: 'messageBox',
      render: (text: string) => (
        text
          ? <span className="text-sm text-[#4a5a6a] line-clamp-2 max-w-md block">{text}</span>
          : <span className="text-xs text-[#cbd5e1] italic">(không có nội dung)</span>
      ),
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'locale',
      key: 'locale',
      width: 90,
      render: (locale: string) => (
        <Tag color={locale === 'en' ? 'blue' : 'default'} className="font-semibold text-[11px] uppercase">
          {locale === 'en' ? 'EN' : 'VI'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'handled' ? 'green' : 'gold'} className="font-semibold text-[11px]">
          {status === 'handled' ? 'Đã xử lý' : 'Mới'}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => (
        <span className="text-xs text-[#94a3b8]">{dayjs(date).format('HH:mm • DD/MM/YYYY')}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      align: 'right' as const,
      render: (_: any, record: ContactRequest) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => showDetail(record)} />
          </Tooltip>
          {record.status === 'new' ? (
            <Tooltip title="Đánh dấu đã xử lý">
              <Button icon={<CheckCircleOutlined />} onClick={() => updateStatus(record, 'handled')} />
            </Tooltip>
          ) : (
            <Tooltip title="Chuyển về Mới">
              <Button icon={<UndoOutlined />} onClick={() => updateStatus(record, 'new')} />
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-0">
      <AdminPageHeader
        title="Yêu cầu liên hệ"
        breadcrumbItems={[
          { title: 'Admin', href: '/admin' },
          { title: 'Yêu cầu liên hệ' },
        ]}
        searchPlaceholder="Tìm theo tên, SĐT, email, nội dung..."
        onSearch={(val) => updateUrl({ q: val })}
      />

      <div className="flex flex-wrap gap-4">
        <div className="bg-white px-5 py-4 rounded-2xl border border-[#eef1f5] shadow-sm flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 rounded-xl bg-[#eaf1f9] text-[#0a4d8c] flex items-center justify-center"><UserOutlined /></div>
          <div>
            <div className="text-xl font-bold text-[#0c2236] leading-none">{requests.length}</div>
            <div className="text-xs text-[#94a3b8] mt-1">Tổng yêu cầu</div>
          </div>
        </div>
        <div className="bg-white px-5 py-4 rounded-2xl border border-[#eef1f5] shadow-sm flex items-center gap-3 min-w-[180px]">
          <div className="w-10 h-10 rounded-xl bg-[#f9ece4] text-[#c0461a] flex items-center justify-center"><ClockCircleOutlined /></div>
          <div>
            <div className="text-xl font-bold text-[#0c2236] leading-none">{newCount}</div>
            <div className="text-xs text-[#94a3b8] mt-1">Chưa xử lý</div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 rounded-2xl">
        <Table size="small" sticky
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          className="admin-table"
          pagination={{
            current: page,
            pageSize: 10,
            className: 'p-6 border-t border-gray-50',
            onChange: (p) => updateUrl({ page: p }),
          }}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <MailOutlined />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-[#0c2236]">Chi tiết yêu cầu</div>
              {selected && (
                <div className="text-xs text-[#94a3b8] font-normal">
                  {dayjs(selected.createdAt).format('HH:mm • DD/MM/YYYY')}
                </div>
              )}
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={selected ? [
          <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>,
          selected.status === 'new' ? (
            <Button key="handle" type="primary" icon={<CheckCircleOutlined />} onClick={() => updateStatus(selected, 'handled')}>
              Đánh dấu đã xử lý
            </Button>
          ) : (
            <Button key="reopen" icon={<UndoOutlined />} onClick={() => updateStatus(selected, 'new')}>
              Chuyển về Mới
            </Button>
          ),
        ] : null}
        width={600}
      >
        {selected && (
          <Descriptions column={1} bordered size="small" className="mt-4" labelStyle={{ width: 130, fontWeight: 600 }}>
            <Descriptions.Item label="Họ và tên">{selected.fullName}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <a href={`tel:${selected.phoneNumber}`} className="text-primary">{selected.phoneNumber}</a>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selected.emailAddress
                ? <a href={`mailto:${selected.emailAddress}`} className="text-primary">{selected.emailAddress}</a>
                : <span className="text-[#94a3b8]">—</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Ngôn ngữ">{selected.locale === 'en' ? 'Tiếng Anh' : 'Tiếng Việt'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selected.status === 'handled' ? 'green' : 'gold'} className="font-semibold">
                {selected.status === 'handled' ? 'Đã xử lý' : 'Mới'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              {selected.messageBox
                ? <p className="whitespace-pre-wrap text-[#33414f] leading-relaxed">{selected.messageBox}</p>
                : <span className="text-[#94a3b8] italic">(không có nội dung)</span>}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </motion.div>
  );
}

export default function AdminContactRequestsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <AdminContactRequestsPageContent />
    </React.Suspense>
  );
}
