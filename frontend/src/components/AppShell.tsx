'use client';
import React, { useState } from 'react';
import { Layout, Typography, Flex, Skeleton, Alert, Button, Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useTodos } from '@/context/TodoContext';
import CreateTodoForm from '@/components/CreateTodoForm';
import TodoList from '@/components/TodoList';
import BottomNav from '@/components/BottomNav';
import HistoryPage from '@/components/HistoryPage';

const { Header, Content } = Layout;

type Tab = 'main' | 'history';

export default function AppShell() {
  const { loading, error, fetchTodos, fetchCategories } = useTodos();
  const [activeTab, setActiveTab] = useState<Tab>('main');

  if (error && !loading) {
    return (
      <div style={{ maxWidth: 860, margin: '40px auto', padding: '0 16px' }}>
        <Alert
          message="Error loading application"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={() => { fetchCategories(); fetchTodos(); }}>Retry</Button>}
          style={{ borderRadius: 16, border: '2px solid #225555', boxShadow: '4px 4px 0px 0px #225555' }}
        />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#FAFAEE' }}>
      <Header style={{
        background: '#FAFAEE',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '4px solid #225555',
        boxShadow: '0 4px 0px 0px rgba(34, 85, 85, 0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 72,
      }}>
        <Flex align="center" gap={12}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#225555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #225555',
            boxShadow: '2px 2px 0px 0px #51463B',
          }}>
            <InboxOutlined style={{ color: '#FAFAEE', fontSize: 20 }} />
          </div>
          <Typography.Title level={4} style={{
            margin: 0, color: '#225555',
            fontSize: 22, fontWeight: 900, letterSpacing: '-0.3px',
            fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
          }}>
            Todo App
          </Typography.Title>
        </Flex>
      </Header>

      <Content style={{ maxWidth: 880, width: '100%', margin: '24px auto 0', padding: '0 16px 100px' }}>
        {activeTab === 'main' ? (
          loading ? (
            <Card style={{ borderRadius: 20, border: '3px solid #225555', boxShadow: '6px 6px 0px 0px #225555' }}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          ) : (
            <>
              <CreateTodoForm />
              <TodoList />
            </>
          )
        ) : (
          <HistoryPage />
        )}
      </Content>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </Layout>
  );
}
