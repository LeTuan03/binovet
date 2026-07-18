"use client";

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Breadcrumb, Avatar, Tooltip, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import AdminTableFilterBar from '@/components/admin/AdminTableFilterBar';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

const initialUsers = [
  { id: 1, name: 'binovet Admin', email: 'admin@binovet.com.vn', role: 'SuperAdmin', lastActive: '10 phút trước', avatar: null },
  { id: 2, name: 'Editor 01', email: 'editor@binovet.com.vn', role: 'Editor', lastActive: '2 giờ trước', avatar: null },
];

function AdminUsersPageContent() {
  const { message: msg, modal } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const roleFilter = searchParams.get('role') || '';

  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [passForm] = Form.useForm();

  // Derived filtered data
  const filteredData = useMemo(() => {
    return users.filter(item => {
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase()) ||
        item.role.toLowerCase().includes(query.toLowerCase());
      const matchesRole = !roleFilter || item.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const updateUrl = (params: Record<string, string | number | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    let resetPage = false;

    Object.entries(params).forEach(([key, value]) => {
      if (key === 'page') {
        newSearchParams.set('page', String(value));
      } else {
        if (value !== undefined && value !== '') newSearchParams.set(key, String(value));
        else newSearchParams.delete(key);
        resetPage = true; // Reset to page 1 on search/filter change
      }
    });
    if (resetPage) newSearchParams.set('page', '1');

    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const showModal = (record?: any) => {
    if (record) {
      setSelectedUser(record);
      form.setFieldsValue(record);
    } else {
      setSelectedUser(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      setGlobalLoading(true);
      try {
        if (selectedUser && !isPassModalOpen) {
          setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...values } : u)));
          msg.success('Cập nhật tài khoản thành công');
        } else {
          const newUser = {
            ...values,
            id: Math.max(...users.map((u) => u.id), 0) + 1,
            lastActive: 'Vừa xong',
            avatar: null,
          };
          setUsers([...users, newUser]);
          msg.success('Thêm tài khoản mới thành công');
        }
        setIsModalOpen(false);
      } finally {
        setGlobalLoading(false);
      }
    });
  };

  const handleOpenPassModal = (record: any) => {
    setSelectedUser(record);
    passForm.resetFields();
    setIsPassModalOpen(true);
  };

  const handleChangePassword = () => {
    passForm.validateFields().then(async () => {
      setGlobalLoading(true);
      try {
        msg.success(`Đã đổi mật khẩu cho tài khoản ${selectedUser.email}`);
        setIsPassModalOpen(false);
      } finally {
        setGlobalLoading(false);
      }
    });
  };

  const columns = [
    {
      title: 'Tài khoản',
      key: 'user',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.role === 'SuperAdmin' ? '#0a4d8c' : '#d9531f' }} />
          <div>
            <div className="font-semibold text-[#0c2236]">{record.name}</div>
            <div className="text-xs text-[#94a3b8]">{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phân quyền',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'SuperAdmin' ? 'green' : 'gold'} className="font-semibold text-[11px]">
          {role}
        </Tag>
      ),
    },
    {
      title: 'Hoạt động lần cuối',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Đổi mật khẩu">
            <Button icon={<LockOutlined />} onClick={() => handleOpenPassModal(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
                danger 
                icon={<DeleteOutlined />} 
                disabled={record.role === 'SuperAdmin'}
                onClick={() => {
                   modal.confirm({
                      title: 'Xác nhận xóa tài khoản?',
                      content: `Bạn có chắc muốn xóa tài khoản ${record.name}?`,
                      okText: 'Xóa ngay',
                      cancelText: 'Hủy',
                      okType: 'danger',
                      onOk: async () => {
                         setGlobalLoading(true);
                         try {
                            setUsers(users.filter(u => u.id !== record.id));
                            msg.success('Đã xóa tài khoản');
                         } finally {
                            setGlobalLoading(false);
                         }
                      }
                   });
                }} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <Breadcrumb items={[{ title: 'Admin', href: '/admin' }, { title: 'Quản lý Người dùng' }]} className="text-[11px] text-[#94a3b8]" />
          <h1 className="font-display text-2xl font-semibold text-[#0c2236] tracking-tight">Tài khoản Quản trị viên</h1>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-[0_1px_2px_rgba(12,34,54,0.04),0_8px_24px_rgba(12,34,54,0.05)] border border-[#eef1f5]">
        <div className="flex items-center gap-3 mb-8 p-4 rounded-xl text-[#c0461a]" style={{ background: '#f9ece4', border: '1px solid #f3d9cc' }}>
          <SafetyCertificateOutlined />
          <span className="font-medium text-sm">Cảnh báo: Chỉ SuperAdmin mới có quyền tạo mới hoặc phân quyền cho các tài khoản khác.</span>
        </div>

        <AdminTableFilterBar
          className="border border-[#eef1f5] rounded-xl mb-4"
          filters={[
            {
              key: 'role',
              placeholder: 'Phân quyền',
              value: roleFilter || undefined,
              options: [
                { label: 'SuperAdmin', value: 'SuperAdmin' },
                { label: 'Editor', value: 'Editor' },
              ],
            },
          ]}
          onChange={(patch) => updateUrl(patch)}
          search={{
            placeholder: 'Tìm kiếm user...',
            defaultValue: query,
          }}
          primaryAction={{
            label: 'Cấp tài khoản mới',
            onClick: () => showModal(),
            icon: <PlusOutlined />
          }}
        />
        <Table  size="small" sticky
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: 10,
            onChange: (p) => updateUrl({ page: p })
          }}
          className="admin-table border border-[#eef1f5] rounded-xl overflow-hidden"
        />
      </div>

      <Modal
        title={selectedUser ? "Cập nhật tài khoản" : "Cấp mới tài khoản truy cập"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText={selectedUser ? "Cập nhật" : "Tạo tài khoản"}
        cancelText="Hủy"
      >
         <Form form={form} layout="vertical" className="mt-6">
            <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
               <Input placeholder="VD: Nguyễn Văn A" />
            </Form.Item>
            <Form.Item label="Email đăng nhập" name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
               <Input placeholder="email@binovet.com.vn" />
            </Form.Item>
            {!selectedUser && (
              <Form.Item label="Mật khẩu tạm thời" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                 <Input.Password prefix={<LockOutlined className="text-gray-300" />} />
              </Form.Item>
            )}
            <Form.Item label="Quyền hạn" name="role" initialValue="Editor">
               <Select>
                  <Select.Option value="SuperAdmin">SuperAdmin (Toàn quyền)</Select.Option>
                  <Select.Option value="Editor">Editor (Chỉ sửa nội dung)</Select.Option>
               </Select>
            </Form.Item>
         </Form>
      </Modal>

      <Modal
        title={<span>Đổi mật khẩu cho <b>{selectedUser?.name}</b></span>}
        open={isPassModalOpen}
        onOk={handleChangePassword}
        onCancel={() => setIsPassModalOpen(false)}
        okText="Cập nhật mật khẩu"
        cancelText="Bỏ qua"
      >
         <Form form={passForm} layout="vertical" className="mt-6">
            <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
               <Input.Password prefix={<LockOutlined className="text-gray-300" />} />
            </Form.Item>
            <Form.Item label="Xác nhận mật khẩu" name="confirmPassword" dependencies={['newPassword']} rules={[
               { required: true, message: 'Vui lòng xác nhận mật khẩu' },
               ({ getFieldValue }) => ({
                  validator(_, value) {
                     if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                     }
                     return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
               }),
            ]}>
               <Input.Password prefix={<LockOutlined className="text-gray-300" />} />
            </Form.Item>
         </Form>
      </Modal>
    </div>
  );
}


export default function AdminUsersPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <AdminUsersPageContent />
    </React.Suspense>
  );
}
