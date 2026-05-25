'use client';
import React from 'react';
import { Flex, Typography } from 'antd';
import { InboxOutlined, HistoryOutlined } from '@ant-design/icons';

type Tab = 'main' | 'history';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'main', label: 'Main', icon: <InboxOutlined style={{ fontSize: 22 }} /> },
  { key: 'history', label: 'History', icon: <HistoryOutlined style={{ fontSize: 22 }} /> },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#FAFAEE',
        borderTop: '4px solid #225555',
        boxShadow: '0 -4px 0px 0px rgba(34, 85, 85, 0.12)',
        padding: '4px 0',
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
      }}
    >
      <Flex justify="space-around" align="center" style={{ maxWidth: 480, margin: '0 auto' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: 14,
                margin: '0 4px',
                transition: 'all 0.15s ease',
                ...(isActive
                  ? {
                      background: '#225555',
                      boxShadow: '2px 2px 0px 0px #51463B',
                    }
                  : {}),
              }}
            >
              <div style={{
                color: isActive ? '#FAFAEE' : '#51463B',
                transition: 'color 0.15s ease',
                lineHeight: 1,
              }}>
                {tab.icon}
              </div>
              <Typography.Text
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: isActive ? '#FAFAEE' : '#51463B',
                  lineHeight: 1.2,
                  fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
                  transition: 'color 0.15s ease',
                }}
              >
                {tab.label}
              </Typography.Text>
            </button>
          );
        })}
      </Flex>
    </div>
  );
}
