"use client";

import React from 'react';
import { Card, Col, Row, Button } from 'antd';
import {
  ShoppingOutlined,
  AppstoreOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Article } from '@/types';

export default function AdminDashboard() {
  const [data, setData] = React.useState<{
    stats: {
      products: number;
      categories: number;
      articles: number;
    };
    latestArticles: Article[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const stats = [
    {
      title: 'Sản phẩm',
      value: data?.stats.products ?? 0,
      icon: <ShoppingOutlined />,
      tileBg: '#eaf1f9',
      iconColor: '#0a4d8c',
    },
    {
      title: 'Danh mục',
      value: data?.stats.categories ?? 0,
      icon: <AppstoreOutlined />,
      tileBg: '#eaf1f9',
      iconColor: '#0a4d8c',
    },
    {
      title: 'Tin tức & Bài viết',
      value: data?.stats.articles ?? 0,
      icon: <ReadOutlined />,
      tileBg: '#f9ece4',
      iconColor: '#d9531f',
    },
  ];

  if (loading) return <div className="p-12 text-center font-medium text-[#94a3b8] animate-pulse tracking-wide">Đang tải dữ liệu...</div>;


  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader 
        title="Quản trị Hệ thống"
        breadcrumbItems={[{ title: 'Admin' }, { title: 'Tổng quan' }]}
      />

      <Row gutter={[24, 24]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="borderless" className="transition-all rounded-2xl overflow-hidden border border-[#eef1f5] shadow-[0_1px_2px_rgba(12,34,54,0.04),0_8px_24px_rgba(12,34,54,0.05)] hover:shadow-[0_4px_8px_rgba(12,34,54,0.06),0_12px_32px_rgba(12,34,54,0.08)]">
                <div className="flex items-center gap-4 p-2">
                   <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: stat.tileBg, color: stat.iconColor }}
                   >
                      {stat.icon}
                   </div>
                   <div className="flex-1">
                      <div className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">{stat.title}</div>
                      <span className="text-2xl font-semibold text-[#0c2236] tracking-tight">
                        {stat.value}
                      </span>
                   </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
         <Col xs={24} lg={24}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="borderless" className="rounded-2xl overflow-hidden border border-[#eef1f5] shadow-[0_1px_2px_rgba(12,34,54,0.04),0_8px_24px_rgba(12,34,54,0.05)]">
                 <div className="p-6">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#eef1f5]">
                       <h3 className="font-display text-lg font-semibold text-[#0c2236] flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-primary text-base" style={{ background: '#eaf1f9' }}>
                             <RocketOutlined />
                          </div>
                          Cập nhật mới nhất
                       </h3>
                       <Button type="text" className="text-primary font-semibold text-xs hover:bg-primary/5">Xem tất cả</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {data?.latestArticles.slice(0, 4).map((a, i) => (
                         <div key={a.id} className="flex items-center gap-4 group cursor-pointer p-3 rounded-xl hover:bg-[#f7f9fc] transition-all border border-transparent hover:border-[#eef1f5]">
                            <div className="w-16 h-16 bg-[#f3f6fb] rounded-xl overflow-hidden shrink-0">
                               <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex flex-col flex-1">
                               <span className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">{a.category}</span>
                               <span className="font-semibold text-[#0c2236] line-clamp-1 text-sm group-hover:text-primary transition-colors mb-1">{a.title}</span>
                               <span className="text-[11px] text-[#94a3b8] font-medium flex items-center gap-1.5">
                                 <ClockCircleOutlined /> {a.publishDate}
                               </span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>
            </motion.div>
         </Col>
      </Row>
    </div>
  );
}
