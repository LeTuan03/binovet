"use client";

import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Card, App } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const { message: msg } = App.useApp();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token && token === process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET) {
      router.push('/admin');
    }
  }, [router]);

  const onFinish = (values: any) => {
    const user = values.username;
    const password = values.password;
    if (user === process.env.NEXT_PUBLIC_ADMIN_USERNAME && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      msg.success('Đăng nhập thành công!');
      localStorage.setItem('admin_token', process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET || '');
      setTimeout(() => {
        router.push('/admin');
      }, 1000);
    } else {
      msg.error('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft navy radial wash */}
      <div className="pointer-events-none absolute top-[-20%] left-1/2 -translate-x-1/2 w-[70%] h-[55%] bg-[radial-gradient(closest-side,rgba(10,77,140,0.10),transparent)]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-9">
          <div className="inline-flex items-center justify-center mb-5">
            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #0a4d8c 0%, #072e57 100%)',
                boxShadow: '0 10px 28px rgba(10,77,140,0.28)',
              }}
            >
              <span className="text-white text-2xl font-bold tracking-tight">B</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#d9531f]"></span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">BINOVET</h1>
          <p className="text-[#4a5a6a] text-sm mt-1.5">Hệ thống Quản trị nội dung</p>
        </div>

        <Card className="rounded-2xl border border-[#eef1f5] shadow-[0_12px_40px_rgba(12,34,54,0.10)] p-2 md:p-5">
          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-[#94a3b8]" />}
                placeholder="Tên đăng nhập"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-[#94a3b8]" />}
                placeholder="Mật khẩu"
                className="rounded-xl h-12"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-xs font-medium text-[#4a5a6a]">Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <a className="text-xs font-semibold text-primary hover:text-primary-dark" href="#">
                Quên mật khẩu?
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 rounded-xl font-semibold text-sm"
                icon={<ArrowRightOutlined />}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <div className="text-center mt-8">
          <p className="text-[#94a3b8] text-xs font-medium">
            &copy; 2026 Bản quyền thuộc về BINOVET.
          </p>
        </div>
      </div>
    </div>
  );
}
