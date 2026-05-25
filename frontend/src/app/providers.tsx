"use client";
import React from 'react';
import { ConfigProvider, App } from 'antd';
import { TodoProvider } from '@/context/TodoContext';

// Cartoon/playful theme
const theme = {
  token: {
    colorPrimary: '#FF6B6B',
    colorSuccess: '#51CF66',
    colorWarning: '#FFD43B',
    colorError: '#FF6B6B',
    colorInfo: '#339AF0',
    borderRadius: 12,
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 16,
    colorBgLayout: '#FFF9F0',
  },
  components: {
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 4px 12px rgba(0,0,0,0.08)',
    },
    Button: {
      borderRadiusLG: 24,
      controlHeightLG: 48,
    },
    Tag: {
      borderRadius: 20,
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      <App notification={{ placement: 'bottomRight', maxCount: 5 }}>
        <TodoProvider>{children}</TodoProvider>
      </App>
    </ConfigProvider>
  );
}
