"use client";

import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ReadOutlined,
  DashboardOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  NotificationOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, ConfigProvider, Avatar, Dropdown, Badge, App } from 'antd';
import viVN from 'antd/locale/vi_VN';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import { usePathname, useRouter } from 'next/navigation';
import { AdminLoadingProvider } from '@/lib/AdminLoadingContext';

dayjs.locale('vi');

const { Header, Sider, Content } = Layout;

// ─── Sidebar section divider label ───────────────────────────────────────────
function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="mx-auto my-2 w-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.14)' }} />
    );
  }
  return (
    <div className="flex items-center gap-2 px-5 pt-5 pb-1.5">
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div className="flex-1 border-t mt-px" style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token || token !== process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET) {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  // ─── Menu sections ──────────────────────────────────────────────────────────
  const dashboardItems: any[] = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
  ];

  const contentItems: any[] = [
    { key: '/admin/products',   icon: <ShoppingOutlined />,   label: 'Sản phẩm' },
    { key: '/admin/categories', icon: <AppstoreOutlined />,   label: 'Danh mục' },
    { key: '/admin/articles',   icon: <FileTextOutlined />,   label: 'Bệnh học' },
    { key: '/admin/handbooks',  icon: <BookOutlined />,       label: 'Cẩm nang chăn nuôi' },
    { key: '/admin/news',       icon: <NotificationOutlined />, label: 'Tin tức' },
  ];

  const systemItems: any[] = [
    { key: '/admin/banners',       icon: <PictureOutlined />,    label: 'Banner / Slider' },
    { key: '/admin/media-gallery', icon: <VideoCameraOutlined />, label: 'Video & Hình ảnh' },
    { key: '/admin/menus',         icon: <MenuOutlined />,        label: 'Quản lý Menu' },
    { key: '/admin/settings',      icon: <SettingOutlined />,     label: 'Thông tin chung' },
    { key: '/admin/about',         icon: <InfoCircleOutlined />,  label: 'Trang Giới thiệu' },
  ];

  const userMenuItems = [
    // { key: 'profile',  label: 'Hồ sơ cá nhân',     icon: <UserOutlined /> },
    // { key: 'settings', label: 'Cài đặt tài khoản',  icon: <SettingOutlined /> },
    // { type: 'divider', key: 'div2' },
    { key: 'logout',   label: 'Đăng xuất',          icon: <LogoutOutlined />, danger: true },
  ];

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === 'logout') {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    } else {
      router.push(e.key);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4ef]">
        <div className="text-primary font-semibold">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#0a4d8c',
          colorInfo: '#0a4d8c',
          colorLink: '#0a4d8c',
          colorLinkHover: '#072e57',
          borderRadius: 10,
          fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', system-ui, sans-serif",
          colorBgBase: '#ffffff',
          colorTextHeading: '#0c2236',
          colorText: '#33414f',
          colorTextSecondary: '#4a5a6a',
          colorBorderSecondary: '#eef1f5',
          controlHeight: 40,
        },
        components: {
          Menu: {
            itemSelectedBg: '#eaf1f9',
            itemSelectedColor: '#0a4d8c',
            itemHoverBg: 'rgba(10,77,140,0.05)',
            itemHoverColor: '#0a4d8c',
            itemColor: '#5a6b7a',
            itemHeight: 42,
            itemMarginInline: 8,
            itemBorderRadius: 10,
            itemPaddingInline: 12,
            iconSize: 16,
            fontSize: 13.5,
          },
          Layout: {
            headerBg: '#ffffff',
            headerHeight: 64,
            bodyBg: '#f6f4ef',
            siderBg: '#0a4d8c',
          },
          Button: {
            borderRadius: 10,
            controlHeight: 40,
            fontWeight: 600,
            primaryShadow: '0 2px 8px rgba(10,77,140,0.18)',
          },
          Card: {
            borderRadiusLG: 16,
            boxShadow: '0 1px 2px rgba(12,34,54,0.04), 0 8px 24px rgba(12,34,54,0.05)',
            colorBorderSecondary: '#eef1f5',
          },
          Table: {
            headerBg: '#f3f6fb',
            headerColor: '#072e57',
            headerSplitColor: 'transparent',
            borderColor: '#eef1f5',
            rowHoverBg: '#f7f9fc',
            headerBorderRadius: 12,
            cellPaddingBlock: 14,
          },
          Input: {
            borderRadius: 10,
            controlHeight: 40,
            activeBorderColor: '#0a4d8c',
            hoverBorderColor: '#0a4d8c',
            activeShadow: '0 0 0 2px rgba(10,77,140,0.10)',
          },
          Select: {
            borderRadius: 10,
            controlHeight: 40,
            optionSelectedBg: '#eaf1f9',
            optionSelectedColor: '#0a4d8c',
          },
          DatePicker: {
            borderRadius: 10,
            controlHeight: 40,
            activeBorderColor: '#0a4d8c',
            hoverBorderColor: '#0a4d8c',
          },
          Tabs: {
            inkBarColor: '#0a4d8c',
            itemSelectedColor: '#0a4d8c',
            itemHoverColor: '#0a4d8c',
            itemActiveColor: '#0a4d8c',
            titleFontSize: 14,
          },
          Tag: {
            borderRadiusSM: 8,
          },
          Modal: {
            borderRadiusLG: 16,
            titleFontSize: 17,
          },
          Pagination: {
            borderRadius: 10,
            itemActiveBg: '#0a4d8c',
          },
          Segmented: {
            borderRadius: 10,
            itemSelectedBg: '#ffffff',
            itemSelectedColor: '#0a4d8c',
            trackBg: '#eef1f5',
          },
          Tooltip: {
            colorBgSpotlight: '#06243f',
            borderRadius: 8,
          },
        },
      }}
    >
      <AdminLoadingProvider>
        <App>
          <Layout hasSider className="h-screen">
            {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
            <Sider
              trigger={null}
              collapsible
              collapsed={collapsed}
              theme="light"
              width={248}
              collapsedWidth={68}
              style={{
                overflow: 'hidden',
                height: '100vh',
                position: 'sticky',
                top: 0,
                left: 0,
                background: 'linear-gradient(180deg, #0a4d8c 0%, #083f73 52%, #072e57 100%)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '1px 0 24px rgba(7,46,87,0.28)',
                transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Logo */}
              <div
                style={{
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '0' : '0 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  gap: 10,
                  transition: 'all 0.2s',
                  overflow: 'hidden',
                }}
              >
                {/* Icon mark */}
                <div
                  style={{
                    position: 'relative',
                    minWidth: 34,
                    height: 34,
                    borderRadius: 10,
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
                  }}
                >
                  <span style={{ color: '#0a4d8c', fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>B</span>
                  <span
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#d9531f',
                    }}
                  />
                </div>

                {/* Brand name — hide when collapsed */}
                {!collapsed && (
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        letterSpacing: '-0.1px',
                        color: '#ffffff',
                        lineHeight: 1.15,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      BINOVET
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Admin Panel
                    </div>
                  </div>
                )}
              </div>

              {/* Menu content — scrollable middle section */}
              <div className="admin-sider-scroll" style={{ padding: '8px 0 16px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                <ConfigProvider
                  theme={{
                    components: {
                      Menu: {
                        itemBg: 'transparent',
                        subMenuItemBg: 'transparent',
                        itemColor: 'rgba(255,255,255,0.74)',
                        itemHoverColor: '#ffffff',
                        itemHoverBg: 'rgba(255,255,255,0.08)',
                        itemSelectedColor: '#ffffff',
                        itemSelectedBg: 'rgba(255,255,255,0.14)',
                        itemActiveBg: 'rgba(255,255,255,0.10)',
                        itemHeight: 44,
                        itemMarginInline: 10,
                        itemBorderRadius: 10,
                        itemPaddingInline: 14,
                        iconSize: 17,
                        fontSize: 14,
                      },
                    },
                  }}
                >
                  <SectionLabel label="Dashboard" collapsed={collapsed} />
                  <Menu
                    mode="inline"
                    className="admin-sider-menu"
                    selectedKeys={[pathname]}
                    items={dashboardItems}
                    onClick={handleMenuClick}
                    inlineIndent={12}
                    style={{ border: 'none', background: 'transparent' }}
                  />

                  <SectionLabel label="Nội dung" collapsed={collapsed} />
                  <Menu
                    mode="inline"
                    className="admin-sider-menu"
                    selectedKeys={[pathname]}
                    items={contentItems}
                    onClick={handleMenuClick}
                    inlineIndent={12}
                    style={{ border: 'none', background: 'transparent' }}
                  />

                  <SectionLabel label="Hệ thống" collapsed={collapsed} />
                  <Menu
                    mode="inline"
                    className="admin-sider-menu"
                    selectedKeys={[pathname]}
                    items={systemItems}
                    onClick={handleMenuClick}
                    inlineIndent={12}
                    style={{ border: 'none', background: 'transparent' }}
                  />
                </ConfigProvider>
              </div>

              {/* ─── SIDEBAR FOOTER ACTIONS ───────────────────────────────────── */}
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  padding: collapsed ? '12px 10px 16px' : '14px 14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {/* Về trang chủ */}
                <button
                  type="button"
                  onClick={() => window.open('/', '_blank')}
                  title="Về trang chủ"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 10,
                    width: '100%',
                    height: 40,
                    padding: collapsed ? 0 : '0 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.16)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.82)',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.82)';
                  }}
                >
                  <HomeOutlined style={{ fontSize: 16 }} />
                  {!collapsed && <span>Về trang chủ</span>}
                </button>

                {/* Đăng xuất */}
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('admin_token');
                    router.push('/admin/login');
                  }}
                  title="Đăng xuất"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    height: 40,
                    padding: collapsed ? 0 : '0 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#ffffff',
                    color: '#c0461a',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fdeee7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <LogoutOutlined style={{ fontSize: 16 }} />
                  {!collapsed && <span>Đăng xuất</span>}
                </button>
              </div>
            </Sider>

            {/* ─── MAIN AREA ────────────────────────────────────────────────────── */}
            <Layout style={{ background: '#f6f4ef' }}>
              {/* Header */}
              <Header
                style={{
                  padding: '0 24px',
                  background: '#ffffff',
                  borderBottom: '1px solid #eef1f5',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(12,34,54,0.04)',
                  overflow: 'hidden',
                }}
              >
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    width: 38,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    color: '#5a6b7a',
                    fontSize: 16,
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {/* User menu */}
                  <Dropdown
                    menu={{ items: userMenuItems as any, onClick: handleMenuClick }}
                    placement="bottomRight"
                    arrow={false}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        cursor: 'pointer',
                        padding: '5px 10px 5px 5px',
                        borderRadius: 10,
                        transition: 'background 0.15s',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Avatar
                        size={32}
                        style={{
                          backgroundColor: '#0a4d8c',
                          boxShadow: '0 2px 8px rgba(10,77,140,0.22)',
                        }}
                        icon={<UserOutlined />}
                      />
                      <div className="hidden lg:block" style={{ lineHeight: 'normal' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0c2236', lineHeight: 1.2 }}>
                          Admin
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                          Quản trị viên
                        </div>
                      </div>
                    </div>
                  </Dropdown>
                </div>
              </Header>

              {/* Page content */}
              <Content
                style={{
                  padding: 24,
                  paddingBottom: 0,
                  minHeight: 280,
                  background: '#f6f4ef',
                  flex: 'auto',
                }}
              >
                <div style={{ maxWidth: 1600, margin: '0 auto' }}>
                  {children}
                </div>
              </Content>
            </Layout>
          </Layout>
        </App>
      </AdminLoadingProvider>
    </ConfigProvider>
  );
}