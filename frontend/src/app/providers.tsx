"use client";
import React from 'react';
import { ConfigProvider, App, theme } from 'antd';
import { TodoProvider } from '@/context/TodoContext';

const cartoonTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorText: '#2C3E35',
    colorPrimary: '#225555',
    colorSuccess: '#3D8B5A',
    colorWarning: '#C8873A',
    colorError: '#C86060',
    colorInfo: '#4A9BAF',
    colorBorder: '#C8DAD4',
    colorBorderSecondary: '#E0ECEB',
    lineWidth: 1,
    lineWidthBold: 2,
    borderRadius: 14,
    borderRadiusLG: 18,
    borderRadiusSM: 10,
    controlHeightSM: 28,
    controlHeight: 36,
    controlHeightLG: 48,
    colorBgBase: '#F5FAF7',
    colorBgLayout: '#EDF3EF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgSpotlight: '#1A4A4A',
    boxShadow: '0 1px 4px rgba(34,85,85,0.06), 0 4px 16px rgba(34,85,85,0.06)',
    boxShadowSecondary: '0 4px 24px rgba(34,85,85,0.12)',
    fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 15,
    fontSizeLG: 17,
    fontSizeHeading3: 21,
    fontSizeHeading4: 17,
    fontWeightStrong: 700,
    colorLink: '#225555',
    colorLinkHover: '#2D8080',
    motionDurationMid: '0.2s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  components: {
    Button: {
      primaryShadow: '0 2px 8px rgba(34,85,85,0.25)',
      dangerShadow: '0 2px 6px rgba(200,96,96,0.2)',
      defaultShadow: 'none',
      defaultBorderColor: '#C8DAD4',
      defaultColor: '#225555',
      primaryColor: '#FFFFFF',
      borderRadiusLG: 24,
      controlHeightLG: 44,
      fontWeight: 700,
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      borderRadiusLG: 18,
      boxShadow: '0 1px 4px rgba(34,85,85,0.05), 0 4px 16px rgba(34,85,85,0.06)',
      paddingLG: 20,
    },
    Modal: {
      boxShadow: '0 8px 40px rgba(34,85,85,0.18)',
      borderRadiusLG: 18,
    },
    Select: {
      optionSelectedBg: '#E8F2EE',
      optionSelectedColor: '#225555',
      borderRadius: 12,
    },
    Input: {
      borderRadius: 12,
      colorBorder: '#C8DAD4',
      hoverBorderColor: '#3A7A6A',
      activeBorderColor: '#225555',
      activeShadow: '0 0 0 3px rgba(34,85,85,0.10)',
    },
    Tag: {
      borderRadius: 20,
      lineWidth: 0,
    },
    Drawer: {
      borderRadiusLG: 18,
      colorBgElevated: '#FFFFFF',
    },
    Progress: { borderRadius: 10 },
    Checkbox: { borderRadius: 6 },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={cartoonTheme}>
      <App notification={{ placement: 'bottomRight', maxCount: 5 }}>
        <TodoProvider>{children}</TodoProvider>
      </App>
    </ConfigProvider>
  );
}
