"use client";

import React from 'react';
import {
  Modal, Form, Input, Select,
  Row, Col, Divider, Switch, Button, Tabs
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';

import ImageUpload from '@/components/admin/ImageUpload';
import MultiImageUpload from '@/components/admin/MultiImageUpload';
import { Category } from '@/types';
import TextArea from 'antd/es/input/TextArea';

interface ProductModalProps {
  open: boolean;
  editingId: bigint | null;
  form: ReturnType<typeof Form.useForm>[0];
  categories: Category[];
  onOk: () => void;
  onCancel: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  editingId,
  form,
  categories,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            {editingId ? <EditOutlined /> : <PlusOutlined />}
          </div>
          <span className="text-2xl font-black uppercase italic tracking-tighter text-binovet-dark">
            {editingId ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
          </span>
        </div>
      }
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={1000}
      okText={editingId ? "Cập nhật dữ liệu" : "Thêm mới ngay"}
      cancelText="Hủy bỏ"
      styles={{
        body: {
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        },
      }}
      centered
      okButtonProps={{ className: "rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-[11px] border-none shadow-lg shadow-primary/20" }}
      cancelButtonProps={{ className: "rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-[11px]" }}
    >
      <Form form={form} layout="vertical" className="mt-6 px-4 pb-8">
        <Row gutter={24}>
          <Col span={20}>
            <Tabs
              items={[
                {
                  key: 'vi',
                  label: '🇻🇳 Tiếng Việt',
                  forceRender: true,
                  children: (
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                          <Input className="rounded-xl py-2 font-bold" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="description" label="Miêu tả">
                          <TextArea rows={3} className="rounded-xl" placeholder="Nhập miêu tả ngắn về sản phẩm..." />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'en',
                  label: '🇬🇧 English',
                  forceRender: true,
                  children: (
                    <Row gutter={24}>
                      <Col span={24}>
                        <Form.Item name="nameEn" label="Tên sản phẩm (EN)">
                          <Input className="rounded-xl py-2 font-bold" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="descriptionEn" label="Mô tả (EN)">
                          <TextArea rows={3} className="rounded-xl" placeholder="Short product description in English..." />
                        </Form.Item>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />
          </Col>
          <Col span={4}>
             <Form.Item name="featured" label="Nổi bật" valuePropName="checked">
                <Switch className="bg-gray-200" />
             </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
              <Select
                options={categories.map(c => ({ label: c.name, value: c.id }))}
                className="w-full"
                placeholder="Chọn danh mục"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="registrationNumber" label="Số đăng ký">
              <Input className="rounded-xl py-2" placeholder="Nhập số đăng ký sản phẩm..." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
             <Form.Item name="image" label="Hình ảnh chính sản phẩm">
                <ImageUpload label="Chọn ảnh chính" />
             </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item name="images" label={
              <div className="flex items-center gap-2">
                <span>Ảnh phụ sản phẩm</span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tối đa 8 ảnh
                </span>
              </div>
            }>
              <MultiImageUpload label="Thêm ảnh phụ" maxCount={8} />
            </Form.Item>
          </Col>
        </Row>

        <Divider>
          <span className="text-[11px] font-black uppercase tracking-widest text-primary">Thông số sản phẩm</span>
        </Divider>

        <Form.List name="specifications">
          {(fields, { add, remove }) => (
            <div className="space-y-4">
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="Tên thông số (VD: THÀNH PHẦN)"
                        rules={[{ required: true, message: 'Nhập tên thông số' }]}
                      >
                        <Input placeholder="Nhập tiêu đề..." className="rounded-xl font-bold text-primary" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        label="Mô tả chi tiết"
                        rules={[{ required: true, message: 'Nhập mô tả' }]}
                      >
                        <TextArea
                          rows={4}
                          placeholder="Nhập chi tiết thông số..."
                          className="rounded-xl"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className="rounded-xl h-12 border-2 border-dashed border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition-all"
              >
                THÊM THUỘC TÍNH / THÔNG SỐ
              </Button>
            </div>
          )}
        </Form.List>

        <Divider>
          <span className="text-[11px] font-black uppercase tracking-widest text-primary">Thông số sản phẩm (EN)</span>
        </Divider>

        <Form.List name="specificationsEn">
          {(fields, { add, remove }) => (
            <div className="space-y-4">
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        label="Spec title (e.g. COMPOSITION)"
                        rules={[{ required: true, message: 'Enter a spec title' }]}
                      >
                        <Input placeholder="Enter title..." className="rounded-xl font-bold text-primary" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        label="Detailed description"
                        rules={[{ required: true, message: 'Enter the description' }]}
                      >
                        <TextArea
                          rows={4}
                          placeholder="Enter spec details in English..."
                          className="rounded-xl"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className="rounded-xl h-12 border-2 border-dashed border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition-all"
              >
                ADD ENGLISH SPEC / ATTRIBUTE
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ProductModal;
