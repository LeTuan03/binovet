"use client";

import React from 'react';
import { ConfigProvider, App } from 'antd';
import viVN from 'antd/locale/vi_VN';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#0a4d8c',
          colorInfo: '#0a4d8c',
          colorLink: '#0a4d8c',
          borderRadius: 12,
          fontFamily: "'Inter', sans-serif",
          colorTextHeading: '#0c2236',
          colorText: '#33414f',
        },
        components: {
          Input: {
            borderRadius: 12,
            activeBorderColor: '#0a4d8c',
            hoverBorderColor: '#0a4d8c',
          },
          Button: {
            borderRadius: 12,
            fontWeight: 600,
            primaryShadow: '0 6px 18px rgba(10,77,140,0.22)',
          },
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}
