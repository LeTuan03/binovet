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

// Cấu hình theo từng ngôn ngữ — gom toàn bộ nội dung dịch (tên, mô tả, thông số)
// vào cùng một tab để admin không nhầm lẫn giữa các ngôn ngữ.
const LANG_CONFIG = {
  vi: {
    flag: '🇻🇳',
    tabLabel: 'Tiếng Việt',
    banner: 'Đang nhập nội dung TIẾNG VIỆT — đây là bản hiển thị mặc định trên website.',
    bannerClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    nameField: 'name',
    descField: 'description',
    specField: 'specifications',
    nameLabel: 'Tên sản phẩm',
    namePlaceholder: 'VD: Vắc-xin phòng bệnh dại',
    descLabel: 'Mô tả ngắn',
    descPlaceholder: 'Nhập mô tả ngắn về sản phẩm...',
    nameRequired: true,
    specSectionLabel: 'Thông số kỹ thuật',
    specTitleLabel: 'Tên thông số',
    specTitlePlaceholder: 'VD: THÀNH PHẦN',
    specContentLabel: 'Nội dung chi tiết',
    specContentPlaceholder: 'Nhập chi tiết thông số...',
    addSpecLabel: 'Thêm thông số / thuộc tính',
    specTitleRequiredMsg: 'Nhập tên thông số',
    specContentRequiredMsg: 'Nhập nội dung',
  },
  en: {
    flag: '🇬🇧',
    tabLabel: 'English',
    banner: 'Đang nhập nội dung TIẾNG ANH — để trống sẽ tự động dùng bản Tiếng Việt.',
    bannerClass: 'bg-blue-50 border-blue-200 text-blue-700',
    nameField: 'nameEn',
    descField: 'descriptionEn',
    specField: 'specificationsEn',
    nameLabel: 'Tên sản phẩm (Tiếng Anh)',
    namePlaceholder: 'e.g. Rabies vaccine',
    descLabel: 'Mô tả ngắn (Tiếng Anh)',
    descPlaceholder: 'Short product description in English...',
    nameRequired: false,
    specSectionLabel: 'Thông số kỹ thuật (Tiếng Anh)',
    specTitleLabel: 'Tên thông số (Tiếng Anh)',
    specTitlePlaceholder: 'e.g. COMPOSITION',
    specContentLabel: 'Nội dung chi tiết (Tiếng Anh)',
    specContentPlaceholder: 'Enter spec details in English...',
    addSpecLabel: 'Add specification / attribute',
    specTitleRequiredMsg: 'Enter a spec title',
    specContentRequiredMsg: 'Enter the description',
  },
} as const;

type LangCfg = (typeof LANG_CONFIG)[keyof typeof LANG_CONFIG];

// Panel nội dung cho 1 ngôn ngữ: tên + mô tả + danh sách thông số.
const LangPanel: React.FC<{ cfg: LangCfg }> = ({ cfg }) => (
  <div className="pt-1">
    <Form.Item
      name={cfg.nameField}
      label={cfg.nameLabel}
      rules={cfg.nameRequired ? [{ required: true, message: 'Vui lòng nhập tên sản phẩm' }] : undefined}
    >
      <Input className="rounded-xl py-2 font-bold" placeholder={cfg.namePlaceholder} />
    </Form.Item>

    <Form.Item name={cfg.descField} label={cfg.descLabel}>
      <TextArea rows={3} className="rounded-xl" placeholder={cfg.descPlaceholder} />
    </Form.Item>

    <Divider className="!my-6">
      <span className="text-[11px] font-black uppercase tracking-widest text-primary">{cfg.specSectionLabel}</span>
    </Divider>

    <Form.List name={cfg.specField}>
      {(fields, { add, remove }) => (
        <div className="space-y-4">
          {fields.map(({ key, name, ...restField }) => (
            <div key={key} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    {...restField}
                    name={[name, 'title']}
                    label={cfg.specTitleLabel}
                    rules={[{ required: true, message: cfg.specTitleRequiredMsg }]}
                  >
                    <Input placeholder={cfg.specTitlePlaceholder} className="rounded-xl font-bold text-primary" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    {...restField}
                    name={[name, 'content']}
                    label={cfg.specContentLabel}
                    rules={[{ required: true, message: cfg.specContentRequiredMsg }]}
                  >
                    <TextArea rows={4} placeholder={cfg.specContentPlaceholder} className="rounded-xl" />
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
            className="rounded-xl h-12 border-2 border-dashed border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition-all uppercase tracking-wider text-[12px] font-bold"
          >
            {cfg.addSpecLabel}
          </Button>
        </div>
      )}
    </Form.List>
  </div>
);

// Nhãn tiêu đề cho từng khối — giúp phân biệt rõ vùng "dùng chung" và vùng "theo ngôn ngữ".
const SectionLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <div className="flex items-center gap-3 mt-4">
    <span className="text-[12px] font-black uppercase tracking-widest text-binovet-dark">{children}</span>
    {hint && (
      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
        {hint}
      </span>
    )}
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

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
        {/* ===== KHỐI 1: Nội dung theo ngôn ngữ ===== */}
        <SectionLabel>Nội dung theo ngôn ngữ</SectionLabel>
        <Tabs
          items={[
            {
              key: 'vi',
              label: <span className="font-bold">{LANG_CONFIG.vi.flag} {LANG_CONFIG.vi.tabLabel}</span>,
              forceRender: true,
              children: <LangPanel cfg={LANG_CONFIG.vi} />,
            },
            {
              key: 'en',
              label: <span className="font-bold">{LANG_CONFIG.en.flag} {LANG_CONFIG.en.tabLabel}</span>,
              forceRender: true,
              children: <LangPanel cfg={LANG_CONFIG.en} />,
            },
          ]}
        />

        {/* ===== KHỐI 2: Thông tin chung (dùng chung cho cả 2 ngôn ngữ) ===== */}
        <SectionLabel hint="Dùng chung 2 ngôn ngữ">Thông tin chung</SectionLabel>
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
        <Form.Item name="featured" label="Sản phẩm nổi bật" valuePropName="checked" tooltip="Bật để hiển thị sản phẩm ở khu vực nổi bật trên trang chủ">
          <Switch className="bg-gray-200" />
        </Form.Item>

        {/* ===== KHỐI 3: Hình ảnh (dùng chung) ===== */}
        <SectionLabel hint="Dùng chung 2 ngôn ngữ">Hình ảnh sản phẩm</SectionLabel>
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
      </Form>
    </Modal>
  );
};

export default ProductModal;
