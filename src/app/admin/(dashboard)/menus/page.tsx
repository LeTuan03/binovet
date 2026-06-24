"use client";

import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Breadcrumb, Divider, Row, Col, Tooltip, App } from 'antd';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined, GlobalOutlined, LinkOutlined, ArrowUpOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { adminFetch } from '@/lib/api';
import { useAdminLoading } from '@/lib/AdminLoadingContext';

function AdminMenusPageContent() {
  const { message: msg, modal } = App.useApp();
  const { setLoading: setGlobalLoading } = useAdminLoading();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  // Load from API
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/data/menus');
      const data = await res.json();
      setMenus(data || []);
    } catch (error) {
      msg.error('Không thể tải dữ liệu menu');
    } finally {
      setLoading(false);
    }
  }, [msg]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived filtered data
  const filteredData = useMemo(() => {
    const rawFiltered = menus.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.link.toLowerCase().includes(query.toLowerCase())
    );

    const finalData: any[] = [];
    const rawFilteredIds = new Set(rawFiltered.map(item => item.id));

    // Lấy các menu gốc (không có parent, hoặc parent không nằm trong kết quả tìm kiếm)
    const rootItems = rawFiltered.filter(item => !item.parent || !rawFilteredIds.has(item.parent));
    
    // Sắp xếp các menu gốc theo thứ tự
    rootItems.sort((a, b) => a.order - b.order);

    // Đệ quy để lấy các menu con và gộp ngay dưới menu cha
    const buildTree = (parents: any[]) => {
       parents.forEach(p => {
          finalData.push(p);
          const children = rawFiltered.filter(item => item.parent === p.id);
          if (children.length > 0) {
             children.sort((a, b) => a.order - b.order);
             buildTree(children);
          }
       });
    };

    buildTree(rootItems);
    return finalData;
  }, [menus, query]);

  const updateUrl = (params: { q?: string }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (params.q !== undefined) {
      if (params.q) newSearchParams.set('q', params.q);
      else newSearchParams.delete('q');
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUrl({ q: e.target.value });
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      order: menus.length + 1,
      position: 'header',
      hasMega: false,
      isButton: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const parsedValues = {
        ...values,
        order: values.order !== undefined && values.order !== '' ? Number(values.order) : menus.length + 1,
      };

      const action = editingItem ? 'update' : 'create';

      setGlobalLoading(true);
      try {
        const res = await adminFetch('/api/data/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            data: parsedValues,
            id: editingItem?.id
          }),
        });
        
        if (res.ok) {
          await fetchData();
          msg.success(editingItem ? 'Cập nhật menu thành công' : 'Thêm menu mới thành công');
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

  const columns = [
    {
      title: 'Tên hiển thị',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <span style={{ paddingLeft: record.parent ? 32 : 0, fontWeight: record.parent ? 'normal' : 'bold' }}>
          {record.parent && <span className="text-gray-300 mr-2 text-xs">└─</span>}
          <span className="text-binovet-dark">{text}</span>
        </span>
      ),
    },
    {
      title: 'Đường dẫn (Link)',
      dataIndex: 'link',
      key: 'link',
      render: (link: string) => <code className="text-[10px] text-primary bg-primary-light px-2 py-0.5 rounded-md font-bold">{link}</code>
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      render: (pos: string) => {
        const colors: Record<string, string> = { header: 'blue', footer: 'purple', both: 'green' };
        const labels: Record<string, string> = { header: 'Header Only', footer: 'Footer Only', both: 'Toàn bộ' };
        return <Tag color={colors[pos]} className="uppercase text-[9px] font-semibold tracking-wide px-2">{labels[pos]}</Tag>;
      },
      filters: [
        { text: 'Header', value: 'header' },
        { text: 'Footer', value: 'footer' },
        { text: 'Cả hai', value: 'both' },
      ],
      onFilter: (value: any, record: any) => record.position === value,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      align: 'center' as const,
      sorter: (a: any, b: any) => a.order - b.order,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} className="text-blue-500" />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => {
                   modal.confirm({
                      title: 'Xác nhận xóa menu?',
                      content: `Bạn có chắc chắn muốn xóa menu "${record.name}" không?`,
                      okText: 'Xóa ngay',
                      cancelText: 'Hủy',
                      okType: 'danger',
                      onOk: async () => {
                         setGlobalLoading(true);
                         try {
                           const res = await adminFetch('/api/data/menus', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                               action: 'delete',
                               id: record.id
                             }),
                           });
                           if (res.ok) {
                             await fetchData();
                             msg.success('Đã xóa menu thành công');
                           } else {
                             const errorData = await res.json();
                             throw new Error(errorData.error || 'Lỗi khi xóa dữ liệu');
                           }
                         } catch (error: any) {
                           msg.error(error.message || 'Lỗi khi xóa dữ liệu');
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
      <AdminPageHeader 
        title="Cơ cấu Điều hướng Web"
        breadcrumbItems={[
          { title: 'Admin' },
          { title: 'Quản lý Menu' },
        ]}
        onSearch={(val) => updateUrl({ q: val })}
        primaryAction={{
          label: 'Thêm Menu mới',
          onClick: handleAdd,
          icon: <PlusOutlined />
        }}
      />

      <div className="bg-white overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 min-h-[500px] rounded-2xl">
        <Table size="small" sticky
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          pagination={false}
          loading={loading}
          className="admin-table"
        />
      </div>

      <Modal
        title={<span className="text-xl font-semibold text-[#0c2236] tracking-tight">{editingItem ? 'Cập nhật' : 'Thêm'} Menu item</span>}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        styles={{
          body: {
            maxHeight: '80vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          },
        }}
        centered
        okText="Lưu lại"
        cancelText="Hủy bỏ"
        className="rounded-2xl"
      >
        <Form form={form} layout="vertical" className="mt-8">
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item name="name" label="Tên hiển thị" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="Ví dụ: Trang chủ, Tin tức..." className="rounded-xl py-3 px-4 font-bold" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="order" label="Thứ tự STT" initialValue={0}>
                <Input type="number" className="rounded-xl py-3 px-4 text-center font-bold" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="nameEn" label="Tên menu (EN)">
            <Input placeholder="Ex: Home, News..." className="rounded-xl py-3 px-4 font-bold" />
          </Form.Item>

          <Form.Item name="link" label="Đường dẫn (Link / Slug)" rules={[{ required: true, message: 'Vui lòng nhập link' }]}>
            <Input placeholder="/tin-tuc" prefix={<LinkOutlined className="text-gray-300" />} className="rounded-xl py-2 px-4" />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="position" label="Vị trí hiển thị" initialValue="header">
                <Select className="rounded-xl h-10">
                  <Select.Option value="header">Header Menu</Select.Option>
                  <Select.Option value="footer">Footer Menu Only</Select.Option>
                  <Select.Option value="both">Cả Header & Footer</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="parent" label="Menu cha (Nếu có)">
                <Select placeholder="Chọn menu cấp trên" className="rounded-xl h-10" allowClear>
                  {menus.filter(m => !m.parent).map(m => (
                    <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
               <Form.Item name="hasMega" label="Mega Menu (Sản phẩm)">
                 <Select className="rounded-xl h-10">
                    <Select.Option value={false}>Không</Select.Option>
                    <Select.Option value={true}>Kích hoạt Mega Menu</Select.Option>
                 </Select>
               </Form.Item>
            </Col>
            <Col span={12}>
               <Form.Item name="isButton" label="Kiểu hiển thị (Nút bấm)">
                  <Select className="rounded-xl h-10">
                    <Select.Option value={false}>Link bình thường</Select.Option>
                    <Select.Option value={true}>Dạng Nút nổi bật</Select.Option>
                  </Select>
               </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}


export default function AdminMenusPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>}>
      <AdminMenusPageContent />
    </React.Suspense>
  );
}
