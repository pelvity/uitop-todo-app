"use client";
import React from 'react';
import { ConfigProvider, App } from 'antd';
import { TodoProvider } from '@/context/TodoContext';
import { useCartoonTheme } from '@/theme/cartoonTheme';

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useCartoonTheme();

  return (
    <ConfigProvider theme={theme}>
      <App notification={{ placement: 'bottomRight', maxCount: 5 }}>
        <TodoProvider>{children}</TodoProvider>
      </App>
    </ConfigProvider>
  );
}
