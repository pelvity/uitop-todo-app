'use client';
import React from 'react';
import { Layout, Typography, Flex, Skeleton, Alert, Button, Input, Card, Tag } from 'antd';
import { SearchOutlined, CheckCircleOutlined, InboxOutlined, FireOutlined } from '@ant-design/icons';
import { useTodos } from '@/context/TodoContext';
import CreateTodoForm from '@/components/CreateTodoForm';
import TodoList from '@/components/TodoList';
import CategoryFilter from '@/components/CategoryFilter';
import HistorySidebar from '@/components/HistorySidebar';

const { Header, Content, Footer } = Layout;

export default function AppShell() {
  const { loading, error, fetchTodos, fetchCategories, searchQuery, setSearchQuery, todos } = useTodos();

  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const progressPercent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

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
        justifyContent: 'space-between',
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
        <HistorySidebar />
      </Header>

      <Content style={{ maxWidth: 880, width: '100%', margin: '32px auto', padding: '0 16px' }}>
        {loading ? (
          <Card style={{ borderRadius: 20, border: '3px solid #225555', boxShadow: '6px 6px 0px 0px #225555' }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        ) : (
          <>
            <Card
              style={{
                borderRadius: 20,
                marginBottom: 20,
                border: '3px solid #225555',
                boxShadow: '6px 6px 0px 0px #225555',
                background: '#FFFFFF',
              }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <Flex gap={12} wrap="wrap" style={{ marginBottom: 16 }}>
                <Input
                  size="large"
                  placeholder="Search tasks..."
                  prefix={<SearchOutlined style={{ color: '#225555' }} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                  variant="outlined"
                  style={{ flex: 1, minWidth: 200, borderRadius: 14, border: '3px solid #225555', height: 48, fontWeight: 800 }}
                />
                <CategoryFilter />
              </Flex>
              <Flex align="center" gap={12} wrap="wrap" style={{ paddingTop: 14, borderTop: '3px solid #225555' }}>
                <Tag
                  icon={<InboxOutlined />}
                  style={{
                    borderRadius: 24, padding: '4px 14px', fontSize: 14,
                    background: '#9CD3D3', color: '#225555', border: '3px solid #225555', fontWeight: 900, margin: 0,
                    boxShadow: '2px 2px 0px 0px #225555',
                  }}
                >
                  &nbsp;{totalTodos} total
                </Tag>
                <Tag
                  icon={<CheckCircleOutlined />}
                  style={{
                    borderRadius: 24, padding: '4px 14px', fontSize: 14,
                    background: '#9AD69A', color: '#225555', border: '3px solid #225555', fontWeight: 900, margin: 0,
                    boxShadow: '2px 2px 0px 0px #225555',
                  }}
                >
                  &nbsp;{completedTodos} done
                </Tag>
                {activeTodos > 0 && (
                  <Tag style={{
                    borderRadius: 24, padding: '4px 14px', fontSize: 14,
                    background: '#F0C973', color: '#51463B', border: '3px solid #225555', fontWeight: 900, margin: 0,
                    boxShadow: '2px 2px 0px 0px #225555',
                  }}>
                    {activeTodos} active
                  </Tag>
                )}
                <div style={{ marginLeft: 'auto' }}>
                  <Typography.Text style={{ fontSize: 15, fontWeight: 900, color: '#225555' }}>
                    {progressPercent}% complete
                  </Typography.Text>
                </div>
              </Flex>
            </Card>

            <CreateTodoForm />
            <TodoList />
          </>
        )}
      </Content>

      <Footer style={{
        textAlign: 'center',
        background: 'transparent',
        color: '#51463B',
        fontSize: 13,
        padding: '16px 24px 24px',
        fontWeight: 800,
        fontFamily: "'Nunito', sans-serif",
      }}>
        Todo App &mdash; NestJS + Next.js + Ant Design Cartoon Style
      </Footer>
    </Layout>
  );
}
