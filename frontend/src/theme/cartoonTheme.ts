import { useMemo } from 'react';
import { theme } from 'antd';
import type { ConfigProviderProps } from 'antd';

export const useCartoonTheme = () => {
  return useMemo<ConfigProviderProps>(
    () => ({
      theme: {
        algorithm: theme.defaultAlgorithm,
        token: {
          colorText: '#51463B',
          colorPrimary: '#225555',
          colorError: '#DA8787',
          colorInfo: '#9CD3D3',
          colorInfoBorder: '#225555',
          colorBorder: '#225555', // Thick dark border
          colorBgBase: '#FAFAEE', // Warm off-white
          colorBgContainer: '#FFFFFF',
          colorBgElevated: '#FFFFFF',
          colorBgLayout: '#FAFAEE',
          colorSuccess: '#9AD69A',
          colorWarning: '#F0C973',
          lineWidth: 2, // Cartoon style thick borders
          lineType: 'solid',
          borderRadius: 12,
          borderRadiusLG: 18,
          borderRadiusSM: 8,
          controlHeightSM: 32,
          controlHeight: 44,
          controlHeightLG: 56,
          boxShadow: '4px 4px 0px 0px #225555', // Offset shadow
          boxShadowSecondary: '6px 6px 0px 0px #225555',
          fontFamily: "'Nunito', 'Comic Sans MS', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 16,
          fontSizeLG: 18,
          fontSizeHeading3: 24,
          fontSizeHeading4: 20,
          fontWeightStrong: 800,
        },
        components: {
          Button: {
            primaryShadow: '4px 4px 0px 0px #51463B',
            dangerShadow: '4px 4px 0px 0px #51463B',
            defaultShadow: '3px 3px 0px 0px #225555',
            defaultBorderColor: '#225555',
            defaultBg: '#FFFFFF',
            defaultColor: '#51463B',
            primaryColor: '#FFFFFF',
            borderRadiusLG: 24,
            controlHeightLG: 52,
            fontWeight: 800,
            paddingInline: 24,
          },
          Card: {
            colorBgContainer: '#FFFFFF',
            borderRadiusLG: 20,
            boxShadow: '6px 6px 0px 0px #225555', // Big cartoon shadow
            paddingLG: 24,
            colorBorder: '#225555', // Enforce border on card
          },
          Modal: {
            boxShadow: '10px 10px 0px 0px #225555',
            borderRadiusLG: 20,
          },
          Select: {
            optionSelectedBg: '#9CD3D3',
            optionSelectedColor: '#225555',
            borderRadius: 14,
            hoverBorderColor: '#51463B',
            activeBorderColor: '#225555',
          },
          Input: {
            borderRadius: 14,
            colorBorder: '#225555',
            hoverBorderColor: '#51463B',
            activeBorderColor: '#225555',
            activeShadow: 'none',
          },
          Tag: {
            borderRadius: 24,
            lineWidth: 2,
            lineType: 'solid',
            colorBorder: '#225555',
          },
          Drawer: {
            borderRadiusLG: 20,
            colorBgElevated: '#FAFAEE',
          },
          Progress: { 
            borderRadius: 12,
          },
          Checkbox: { 
            borderRadius: 6,
            colorBorder: '#225555',
          },
        },
      },
      // Pass the generated classes if needed globally or as antd-style standard
      // (Though ConfigProvider usually just takes `theme` props, but we return styles too)
    }),
    []
  );
};
