"use client";

import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Tabs,
  Breadcrumb,
  Spin,
  App,
  Space,
} from 'antd';
import {
  HistoryOutlined,
  InfoCircleOutlined,
  AimOutlined,
  HomeOutlined,
  TeamOutlined,
  PlusOutlined,
  DeleteOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { adminFetch } from '@/lib/api';
import { useAdminLoading } from '@/lib/AdminLoadingContext';
import { aboutDefaults, mergeAbout } from '@/app/[locale]/(main)/gioi-thieu/aboutDefaults';
import ImageUpload from '@/components/admin/ImageUpload';

const { TextArea } = Input;

export default function AdminAboutPage() {
  const { message: msg } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await adminFetch('/api/data/settings');
        const data = await res.json();
        const merged = mergeAbout(data?.aboutPage);
        form.setFieldsValue({ aboutPage: merged });
      } catch (e) {
        msg.error('Không thể tải nội dung trang Giới thiệu');
        form.setFieldsValue({ aboutPage: aboutDefaults });
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
          body: JSON.stringify({ aboutPage: values.aboutPage }),
        });
        if (res.ok) {
          msg.success('Cập nhật trang Giới thiệu thành công!');
        } else {
          throw new Error();
        }
      } catch (e) {
        msg.error('Lỗi khi lưu nội dung');
      } finally {
        setGlobalLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const inputCls = 'rounded-xl';

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb items={[{ title: 'Admin' }, { title: 'Trang Giới thiệu' }]} />
        <h1 className="text-2xl font-semibold text-[#0c2236] mt-2 tracking-tight">
          Nội dung Trang Giới thiệu
        </h1>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Tabs
            className="admin-settings-tabs"
            items={[
              {
                key: 'lich-su',
                label: (
                  <span className="flex items-center gap-2 font-bold">
                    <HistoryOutlined /> Lịch sử
                  </span>
                ),
                children: (
                  <div className="p-8">
                    <Form.Item
                      name={['aboutPage', 'lichSu', 'title']}
                      label="Tiêu đề"
                    >
                      <Input size="large" className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'lichSu', 'intro']}
                      label="Đoạn mở đầu"
                    >
                      <TextArea rows={3} className={inputCls} />
                    </Form.Item>

                    <div className="mt-4">
                      <div className="font-semibold mb-3 uppercase text-xs tracking-wide text-gray-500">
                        Mốc thời gian
                      </div>
                      <Form.List name={['aboutPage', 'lichSu', 'timeline']}>
                        {(fields, { add, remove }) => (
                          <Space direction="vertical" className="w-full" size="middle">
                            {fields.map((field) => (
                              <div
                                key={field.key}
                                className="p-4 border border-gray-100 rounded-2xl bg-gray-50/40"
                              >
                                <div className="flex items-start gap-3">
                                  <Form.Item
                                    name={[field.name, 'year']}
                                    label="Năm"
                                    className="!mb-2 w-40"
                                  >
                                    <Input size="large" className={inputCls} />
                                  </Form.Item>
                                  <Form.Item
                                    name={[field.name, 'text']}
                                    label="Mô tả"
                                    className="!mb-2 flex-1"
                                  >
                                    <TextArea rows={2} className={inputCls} />
                                  </Form.Item>
                                  <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(field.name)}
                                    className="mt-7"
                                  />
                                </div>
                              </div>
                            ))}
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              onClick={() => add({ year: '', text: '' })}
                              className="rounded-xl"
                            >
                              Thêm mốc
                            </Button>
                          </Space>
                        )}
                      </Form.List>
                    </div>

                    <div className="mt-8">
                      <SaveButton />
                    </div>
                  </div>
                ),
              },
              {
                key: 'gioi-thieu',
                label: (
                  <span className="flex items-center gap-2 font-bold">
                    <InfoCircleOutlined /> Giới thiệu
                  </span>
                ),
                children: (
                  <div className="p-8">
                    <Form.Item
                      name={['aboutPage', 'gioiThieu', 'title']}
                      label="Tiêu đề"
                    >
                      <Input size="large" className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'gioiThieu', 'paragraph1']}
                      label="Đoạn 1"
                    >
                      <TextArea rows={4} className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'gioiThieu', 'paragraph2']}
                      label="Đoạn 2"
                    >
                      <TextArea rows={3} className={inputCls} />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                        name={['aboutPage', 'gioiThieu', 'stat1Number']}
                        label="Chỉ số 1 - Số"
                      >
                        <Input size="large" className={inputCls} />
                      </Form.Item>
                      <Form.Item
                        name={['aboutPage', 'gioiThieu', 'stat1Label']}
                        label="Chỉ số 1 - Nhãn"
                      >
                        <Input size="large" className={inputCls} />
                      </Form.Item>
                      <Form.Item
                        name={['aboutPage', 'gioiThieu', 'stat2Number']}
                        label="Chỉ số 2 - Số"
                      >
                        <Input size="large" className={inputCls} />
                      </Form.Item>
                      <Form.Item
                        name={['aboutPage', 'gioiThieu', 'stat2Label']}
                        label="Chỉ số 2 - Nhãn"
                      >
                        <Input size="large" className={inputCls} />
                      </Form.Item>
                    </div>
                    <SaveButton />
                  </div>
                ),
              },
              {
                key: 'tam-nhin',
                label: (
                  <span className="flex items-center gap-2 font-bold">
                    <AimOutlined /> Tầm nhìn – Sứ mệnh
                  </span>
                ),
                children: (
                  <div className="p-8">
                    <Form.Item
                      name={['aboutPage', 'tamNhin', 'visionTitle']}
                      label="Tiêu đề Tầm nhìn"
                    >
                      <Input size="large" className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'tamNhin', 'visionText']}
                      label="Nội dung Tầm nhìn"
                    >
                      <TextArea rows={4} className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'tamNhin', 'missionTitle']}
                      label="Tiêu đề Sứ mệnh"
                    >
                      <Input size="large" className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'tamNhin', 'missionText']}
                      label="Nội dung Sứ mệnh"
                    >
                      <TextArea rows={4} className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'tamNhin', 'quoteText']}
                      label="Câu trích dẫn"
                    >
                      <TextArea rows={3} className={inputCls} />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                        name={['aboutPage', 'tamNhin', 'quoteAuthor']}
                        label="Tác giả trích dẫn"
                      >
                        <Input size="large" className={inputCls} />
                      </Form.Item>
                      <Form.Item
                        name={['aboutPage', 'tamNhin', 'quoteRole']}
                        label="Chức danh / Tổ chức"
                      >
                        <Input size="large" className={inputCls} />
                      </Form.Item>
                    </div>
                    <SaveButton />
                  </div>
                ),
              },
              {
                key: 'thanh-tuu',
                label: (
                  <span className="flex items-center gap-2 font-bold">
                    <TrophyOutlined /> Thành tựu
                  </span>
                ),
                children: (
                  <div className="p-8">
                    <Form.Item
                      name={['aboutPage', 'thanhTuu', 'heading']}
                      label="Tiêu đề chính"
                    >
                      <Input size="large" className={inputCls} placeholder="VD: Thành tựu" />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'thanhTuu', 'title']}
                      label="Mô tả"
                    >
                      <TextArea rows={4} className={inputCls} />
                    </Form.Item>

                    <div className="mt-4">
                      <div className="font-semibold mb-3 uppercase text-xs tracking-wide text-gray-500">
                        Danh sách ảnh thành tựu
                      </div>
                      <Form.List name={['aboutPage', 'thanhTuu', 'images']}>
                        {(fields, { add, remove }) => (
                          <Space direction="vertical" className="w-full" size="middle">
                            {fields.map((field) => (
                              <div
                                key={field.key}
                                className="p-4 border border-gray-100 rounded-2xl bg-gray-50/40 flex items-start gap-3"
                              >
                                <div className="w-40 shrink-0">
                                  <Form.Item
                                    name={[field.name, 'url']}
                                    label="Ảnh"
                                    className="!mb-0"
                                  >
                                    <ImageUpload />
                                  </Form.Item>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <Form.Item
                                    name={[field.name, 'subtitle']}
                                    label="Phụ đề"
                                    className="!mb-0"
                                  >
                                    <Input
                                      className={inputCls}
                                      placeholder="VD: Giải thưởng / Danh hiệu"
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    name={[field.name, 'title']}
                                    label="Tiêu đề"
                                    className="!mb-0"
                                  >
                                    <TextArea
                                      rows={3}
                                      className={inputCls}
                                      placeholder='VD: "Doanh nghiệp Uy tín – Phát triển bền vững 2012"'
                                    />
                                  </Form.Item>
                                </div>
                                <Button
                                  danger
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(field.name)}
                                  className="mt-7"
                                />
                              </div>
                            ))}
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              onClick={() => add({ url: '', title: '', subtitle: '' })}
                              className="rounded-xl"
                            >
                              Thêm ảnh
                            </Button>
                          </Space>
                        )}
                      </Form.List>
                    </div>

                    <SaveButton />
                  </div>
                ),
              },
              {
                key: 'co-so',
                label: (
                  <span className="flex items-center gap-2 font-bold">
                    <HomeOutlined /> Cơ sở
                  </span>
                ),
                children: (
                  <div className="p-8">
                    <Form.Item
                      name={['aboutPage', 'coSo', 'title']}
                      label="Tiêu đề"
                    >
                      <Input size="large" className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'coSo', 'intro']}
                      label="Mô tả"
                    >
                      <TextArea rows={3} className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'coSo', 'cardTitle']}
                      label="Tiêu đề thẻ ảnh"
                    >
                      <Input size="large" className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'coSo', 'cardText']}
                      label="Mô tả thẻ ảnh"
                    >
                      <Input size="large" className={inputCls} />
                    </Form.Item>

                    <div className="mt-4">
                      <div className="font-semibold mb-3 uppercase text-xs tracking-wide text-gray-500">
                        Chỉ số nổi bật
                      </div>
                      <Form.List name={['aboutPage', 'coSo', 'stats']}>
                        {(fields, { add, remove }) => (
                          <Space direction="vertical" className="w-full" size="middle">
                            {fields.map((field) => (
                              <div
                                key={field.key}
                                className="p-4 border border-gray-100 rounded-2xl bg-gray-50/40 flex items-start gap-3"
                              >
                                <Form.Item
                                  name={[field.name, 'number']}
                                  label="Số"
                                  className="!mb-2 w-40"
                                >
                                  <Input size="large" className={inputCls} />
                                </Form.Item>
                                <Form.Item
                                  name={[field.name, 'label']}
                                  label="Nhãn"
                                  className="!mb-2 flex-1"
                                >
                                  <Input size="large" className={inputCls} />
                                </Form.Item>
                                <Button
                                  danger
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(field.name)}
                                  className="mt-7"
                                />
                              </div>
                            ))}
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              onClick={() => add({ number: '', label: '' })}
                              className="rounded-xl"
                            >
                              Thêm chỉ số
                            </Button>
                          </Space>
                        )}
                      </Form.List>
                    </div>

                    <div className="mt-8">
                      <SaveButton />
                    </div>
                  </div>
                ),
              },
              {
                key: 'co-cau',
                label: (
                  <span className="flex items-center gap-2 font-bold">
                    <TeamOutlined /> Cơ cấu
                  </span>
                ),
                children: (
                  <div className="p-8">
                    <Form.Item
                      name={['aboutPage', 'coCau', 'title']}
                      label="Tiêu đề"
                    >
                      <Input size="large" className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name={['aboutPage', 'coCau', 'intro']}
                      label="Mô tả"
                    >
                      <TextArea rows={3} className={inputCls} />
                    </Form.Item>

                    <div className="mt-4">
                      <div className="font-semibold mb-3 uppercase text-xs tracking-wide text-gray-500">
                        Sơ đồ vai trò (theo thứ tự)
                      </div>
                      <Form.List name={['aboutPage', 'coCau', 'roles']}>
                        {(fields, { add, remove }) => (
                          <Space direction="vertical" className="w-full" size="middle">
                            {fields.map((field) => (
                              <div
                                key={field.key}
                                className="flex items-center gap-3"
                              >
                                <Form.Item
                                  name={field.name}
                                  className="!mb-0 flex-1"
                                >
                                  <Input
                                    size="large"
                                    className={inputCls}
                                    placeholder="Tên vai trò"
                                  />
                                </Form.Item>
                                <Button
                                  danger
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(field.name)}
                                />
                              </div>
                            ))}
                            <Button
                              type="dashed"
                              icon={<PlusOutlined />}
                              onClick={() => add('')}
                              className="rounded-xl"
                            >
                              Thêm vai trò
                            </Button>
                          </Space>
                        )}
                      </Form.List>
                    </div>

                    <Form.Item
                      name={['aboutPage', 'coCau', 'quoteText']}
                      label="Câu trích dẫn"
                      className="mt-6"
                    >
                      <TextArea rows={4} className={inputCls} />
                    </Form.Item>

                    <SaveButton />
                  </div>
                ),
              },
            ]}
          />
        </Form>
      </div>
    </div>
  );
}

function SaveButton() {
  return (
    <Button
      type="primary"
      size="large"
      htmlType="submit"
      className="rounded-xl px-10 font-semibold uppercase tracking-wide text-xs h-12 shadow-lg shadow-primary/20 mt-4"
    >
      Lưu thay đổi
    </Button>
  );
}
