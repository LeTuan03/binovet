"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Spin } from 'antd';

interface AdminLoadingContextType {
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const AdminLoadingContext = createContext<AdminLoadingContextType | undefined>(undefined);

export const AdminLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const value = React.useMemo(() => ({
    setLoading: setIsLoading,
    isLoading
  }), [isLoading]);

  return (
    <AdminLoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(2px)',
            pointerEvents: 'all'
          }}
        >
          <div className="flex flex-col items-center gap-4">
             <Spin size="large" />
             <div className="text-primary font-black uppercase tracking-widest text-[11px] animate-pulse">
                Đang xử lý dữ liệu...
             </div>
          </div>
        </div>
      )}
    </AdminLoadingContext.Provider>
  );
};

export const useAdminLoading = () => {
  const context = useContext(AdminLoadingContext);
  if (context === undefined) {
    throw new Error('useAdminLoading must be used within an AdminLoadingProvider');
  }
  return context;
};
