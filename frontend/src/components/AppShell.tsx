'use client';
import React from 'react';
import { Layout, Typography, Flex, Skeleton, Alert, Button } from 'antd';
import { useTodos } from '@/context/TodoContext';
import CreateTodoForm from '@/components/CreateTodoForm';
import TodoList from '@/components/TodoList';
import CategoryFilter from '@/components/CategoryFilter';
import HistorySidebar from '@/components/HistorySidebar';

const { Header, Content, Footer } = Layout;

export default function AppShell() {
  const { loading, error, fetchTodos, fetchCategories } = useTodos();

  if (error && !loading) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 16px' }}>
        <Alert
          message="Error loading application"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => { fetchCategories(); fetchTodos(); }}>
              Retry
            </Button>
          }
          style={{ borderRadius: 16 }}
        />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFF9F0' }}>
      <Header
        style={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>
          📝 Todo App
        </Typography.Title>
        <Flex align="center" gap={16}>
          <CategoryFilter />
          <HistorySidebar />
        </Flex>
      </Header>
      <Content style={{ maxWidth: 800, width: '100%', margin: '24px auto', padding: '0 16px' }}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} style={{ borderRadius: 16, padding: 24, background: '#fff' }} />
        ) : (
          <>
            <CreateTodoForm />
            <TodoList />
          </>
        )}
      </Content>
      <Footer style={{ textAlign: 'center', background: 'transparent', color: '#999', fontSize: 12 }}>
        Todo App — Built with NestJS + Next.js + Ant Design
      </Footer>
    </Layout>
  );
}
