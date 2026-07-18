"use client";

import React, { useState } from 'react';
import { Button, Input, Select } from 'antd';
import { FilterOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

export interface AdminTableFilterConfig {
  key: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value?: string;
  width?: number;
}

interface AdminTableFilterBarProps {
  filters?: AdminTableFilterConfig[];
  onChange?: (patch: Record<string, string | undefined>) => void;
  search?: {
    placeholder?: string;
    defaultValue?: string;
  };
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  className?: string;
}

export default function AdminTableFilterBar({ filters = [], onChange, search, primaryAction, className }: AdminTableFilterBarProps) {
  // Giá trị nháp — chỉ đẩy lên URL khi bấm Tìm kiếm / Enter hoặc Đặt lại
  const [draft, setDraft] = useState<Record<string, string | undefined>>(
    () => Object.fromEntries(filters.map((f) => [f.key, f.value]))
  );
  const [keyword, setKeyword] = useState(search?.defaultValue || '');

  const applyAll = () => {
    const patch: Record<string, string | undefined> = { ...draft };
    if (search) patch.q = keyword.trim() || undefined;
    onChange?.(patch);
  };

  const resetAll = () => {
    setDraft({});
    setKeyword('');
    const patch: Record<string, string | undefined> = Object.fromEntries(filters.map((f) => [f.key, undefined]));
    if (search) patch.q = undefined;
    onChange?.(patch);
  };

  return (
    <div className={`px-6 py-4 flex flex-wrap items-center gap-3 bg-[#fbfcfe] ${className ?? 'border-b border-[#eef1f5]'}`}>
      {filters.length > 0 && (
        <span className="flex items-center gap-2 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide">
          <FilterOutlined /> Bộ lọc
        </span>
      )}
      {filters.map((f) => (
        <Select
          key={f.key}
          allowClear
          placeholder={f.placeholder}
          value={draft[f.key] || undefined}
          onChange={(v) => setDraft((prev) => ({ ...prev, [f.key]: v }))}
          options={f.options}
          style={{ width: f.width ?? 170 }}
        />
      ))}
      {search && (
        <Input
          allowClear
          prefix={<SearchOutlined className="text-[#94a3b8]" />}
          placeholder={search.placeholder || 'Tìm kiếm nhanh...'}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={applyAll}
          style={{ width: 240 }}
          className="rounded-lg border-[#eef1f5]"
        />
      )}
      {(filters.length > 0 || search) && (
        <>
          <Button
            type="primary"
            ghost
            icon={<SearchOutlined />}
            onClick={applyAll}
            className="rounded-lg font-semibold"
          >
            Tìm kiếm
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={resetAll}
            className="rounded-lg font-semibold text-[#64748b]"
          >
            Đặt lại
          </Button>
        </>
      )}
      {primaryAction && (
        <Button
          type="primary"
          icon={primaryAction.icon || <PlusOutlined />}
          onClick={primaryAction.onClick}
          className="rounded-lg font-semibold ml-auto"
        >
          {primaryAction.label}
        </Button>
      )}
    </div>
  );
}
