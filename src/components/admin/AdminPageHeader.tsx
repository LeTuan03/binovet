"use client";

import React from 'react';
import { Breadcrumb, Input, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  breadcrumbItems: BreadcrumbItem[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  extra?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  breadcrumbItems,
  searchPlaceholder = "Tìm kiếm nhanh...",
  onSearch,
  primaryAction,
  extra
}: AdminPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col mb-8 gap-4">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <Breadcrumb
            items={breadcrumbItems.map(item => ({
              title: item.href ? <a onClick={() => router.push(item.href!)} className="cursor-pointer">{item.title}</a> : item.title
            }))}
            className="text-[11px] font-medium tracking-wide text-[#94a3b8]"
          />
          <h1 className="font-display text-2xl font-semibold text-[#0c2236] leading-tight tracking-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {extra}
          {onSearch && (
            <Input
              prefix={<SearchOutlined className="text-[#94a3b8]" />}
              placeholder={searchPlaceholder}
              className="w-64 rounded-lg border-[#eef1f5] h-10 px-4"
              onChange={(e) => onSearch(e.target.value)}
            />
          )}
          {primaryAction && (
            <Button
              type="primary"
              icon={primaryAction.icon || <PlusOutlined />}
              onClick={primaryAction.onClick}
              className="rounded-lg font-semibold h-10 px-5"
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-[#eef1f5]"></div>
    </div>
  );
}
