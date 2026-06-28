"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Tabs, Breadcrumb, Spin, App } from 'antd';
import { PhoneOutlined, MailOutlined, HomeOutlined, FacebookOutlined, YoutubeOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { adminFetch } from '@/lib/api';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

export default function AdminSettingsPage() {
  const { message: msg } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  // Load from API on mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await adminFetch('/api/data/settings');
        const data = await res.json();
        form.setFieldsValue(data);
      } catch (e) {
        console.error(e);
        msg.error('Không thể tải cài đặt');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      setGlobalLoading(true);
      try {
        const res = await adminFetch('/api/data/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (res.ok) {
          msg.success('Lưu thay đổi thành công!');
        } else {
          throw new Error(`Lỗi khi lưu cài đặt`);
        }
      } catch (e) {
        console.error(e);
        msg.error('Lỗi khi lưu cài đặt');
      } finally {
        setGlobalLoading(false);
      }
    });
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ title: 'Admin' }, { title: 'Thông tin chung' }]} />
        <h1 className="text-2xl font-semibold text-[#0c2236] mt-2 tracking-tight">Cài đặt Website & Liên hệ</h1>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Tabs
            className="admin-settings-tabs"
            items={[
              {
                key: 'general',
                label: <span className="flex items-center gap-2 font-bold"><HomeOutlined /> Thông tin cơ sở</span>,
                children: (
                  <div className="p-8 max-w-2xl">
                    <h3 className="text-xl font-semibold mb-6 border-b pb-2 tracking-tight text-primary">Trụ sở & Chi nhánh</h3>
                    <Form.Item name="companyName" label="Tên công ty" rules={[{ required: true }]}>
                      <Input size="large" className="rounded-xl" />
                    </Form.Item>
                    <Form.Item name="addressHN" label="Trụ sở chính (Hà Nội)" rules={[{ required: true }]}>
                      <Input size="large" className="rounded-xl" />
                    </Form.Item>
                    <Form.Item name="addressHCM" label="Chi nhánh (Miền Nam)">
                      <Input size="large" className="rounded-xl" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item name="hotline1" label="Hotline 1">
                        <Input size="large" className="rounded-xl" prefix={<PhoneOutlined />} />
                      </Form.Item>
                      <Form.Item name="hotline2" label="Hotline 2">
                        <Input size="large" className="rounded-xl" prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </div>
                    <Form.Item name="email" label="Email chính">
                      <Input size="large" className="rounded-xl" prefix={<MailOutlined />} />
                    </Form.Item>
                    <Form.Item name="website" label="Website">
                      <Input size="large" className="rounded-xl" prefix={<GlobalOutlined />} placeholder="https://binovet.com/" />
                    </Form.Item>
                    <Button type="primary" size="large" htmlType="submit" className="rounded-xl px-10 font-semibold uppercase tracking-wide text-xs h-12 shadow-lg shadow-primary/20">Cập nhật ngay</Button>
                  </div>
                )
              },
              {
                key: 'social',
                label: <span className="flex items-center gap-2 font-bold"><FacebookOutlined /> Mạng xã hội</span>,
                children: (
                  <div className="p-8 max-w-2xl">
                    <h3 className="text-xl font-semibold mb-6 border-b pb-2 tracking-tight text-primary">Liên kết Cộng đồng</h3>
                    <Form.Item name={['social', 'facebook']} label="Facebook Page URL">
                      <Input size="large" className="rounded-xl" prefix={<FacebookOutlined className="text-blue-600" />} placeholder="https://facebook.com/..." />
                    </Form.Item>
                    <Form.Item name={['social', 'zalo']} label="Zalo Phone / Link">
                      <Input size="large" className="rounded-xl" placeholder="0974 999 204" />
                    </Form.Item>
                    <Form.Item name={['social', 'youtube']} label="YouTube Channel">
                      <Input size="large" className="rounded-xl" prefix={<YoutubeOutlined className="text-red-500" />} />
                    </Form.Item>
                    <Button type="primary" size="large" htmlType="submit" className="rounded-xl px-10 font-semibold uppercase tracking-wide text-xs h-12 shadow-lg shadow-primary/20">Lưu liên kết</Button>
                  </div>
                )
              },
              {
                key: 'support',
                label: <span className="flex items-center gap-2 font-bold"><UserOutlined /> Hỗ trợ kỹ thuật</span>,
                children: (
                  <div className="p-8 max-w-2xl">
                    <h3 className="text-xl font-semibold mb-6 border-b pb-2 tracking-tight text-primary">Thông tin Bác sĩ thú y</h3>
                    <Form.Item name={['support', 'doctorName']} label="Họ tên BSTY">
                      <Input size="large" className="rounded-xl" />
                    </Form.Item>
                    <Form.Item name={['support', 'doctorRole']} label="Chức danh">
                      <Input size="large" className="rounded-xl" placeholder="Giám đốc Kỹ thuật" />
                    </Form.Item>
                    <Form.Item name={['support', 'doctorPhone']} label="Số điện thoại hỗ trợ">
                      <Input size="large" className="rounded-xl" prefix={<PhoneOutlined />} />
                    </Form.Item>
                    <Form.Item name={['support', 'doctorEmail']} label="Email hỗ trợ">
                      <Input size="large" className="rounded-xl" prefix={<MailOutlined />} />
                    </Form.Item>
                    <Button type="primary" size="large" htmlType="submit" className="rounded-xl px-10 font-semibold uppercase tracking-wide text-xs h-12 shadow-lg shadow-primary/20">Cập nhật hồ sơ BSTY</Button>
                  </div>
                )
              }
            ]}
          />
        </Form>
      </div>
    </div>
  );
}
