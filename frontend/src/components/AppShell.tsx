'use client';
import React from 'react';
import { Layout, Typography, Flex, Skeleton, Alert, Button, Input, Card, Tag } from 'antd';
import { SearchOutlined, CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';
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
          style={{ borderRadius: 16 }}
        />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #EDF3EF 0%, #E8F0EB 50%, #E4EDE8 100%)' }}>
      <Header style={{
        background: 'linear-gradient(135deg, #1A4444 0%, #225555 60%, #2A6868 100%)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 24px rgba(20,60,60,0.30)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 58,
      }}>
        <Flex align="center" gap={12}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(255,255,255,0.13)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.18)',
          }}>
            <InboxOutlined style={{ color: '#FFFFFF', fontSize: 17 }} />
          </div>
          <Typography.Title level={4} style={{
            margin: 0, color: '#FFFFFF',
            fontSize: 17, fontWeight: 900, letterSpacing: '-0.4px',
          }}>
            Todo App
          </Typography.Title>
        </Flex>
        <HistorySidebar />
      </Header>

      <Content style={{ maxWidth: 880, width: '100%', margin: '28px auto', padding: '0 16px' }}>
        {loading ? (
          <Card style={{ borderRadius: 18, border: 'none', boxShadow: '0 2px 16px rgba(34,85,85,0.08)' }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        ) : (
          <>
            <Card
              style={{
                borderRadius: 20,
                marginBottom: 16,
                border: '1px solid #DDE9E4',
                boxShadow: '0 2px 12px rgba(34,85,85,0.07)',
                background: '#FFFFFF',
              }}
              styles={{ body: { padding: '14px 16px' } }}
            >
              <Flex gap={10} wrap="wrap" style={{ marginBottom: 12 }}>
                <Input
                  size="large"
                  placeholder="Search tasks..."
                  prefix={<SearchOutlined style={{ color: '#8AADA4' }} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  allowClear
                  variant="filled"
                  style={{ flex: 1, minWidth: 200, borderRadius: 12, background: '#F2F7F5' }}
                />
                <CategoryFilter />
              </Flex>
              <Flex align="center" gap={12} style={{ paddingTop: 11, borderTop: '1px solid #EAF1EE' }}>
                <Tag
                  icon={<InboxOutlined />}
                  style={{
                    borderRadius: 20, padding: '2px 10px', fontSize: 13,
                    background: '#EAF3F0', color: '#2A6060', border: 'none', fontWeight: 700, margin: 0,
                  }}
                >
                  &nbsp;{totalTodos} total
                </Tag>
                <Tag
                  icon={<CheckCircleOutlined />}
                  style={{
                    borderRadius: 20, padding: '2px 10px', fontSize: 13,
                    background: '#E6F4EC', color: '#2E7D4F', border: 'none', fontWeight: 700, margin: 0,
                  }}
                >
                  &nbsp;{completedTodos} done
                </Tag>
                {activeTodos > 0 && (
                  <Tag style={{
                    borderRadius: 20, padding: '2px 10px', fontSize: 13,
                    background: '#FFF4E6', color: '#A05C20', border: 'none', fontWeight: 700, margin: 0,
                  }}>
                    {activeTodos} active
                  </Tag>
                )}
                <div style={{ marginLeft: 'auto' }}>
                  <Typography.Text style={{ fontSize: 13, fontWeight: 700, color: progressPercent === 100 ? '#2E7D4F' : '#5A8070' }}>
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
        color: '#8AADA4',
        fontSize: 12,
        padding: '12px 24px 20px',
        fontWeight: 600,
      }}>
        Todo App &mdash; NestJS + Next.js + Ant Design
      </Footer>
    </Layout>
  );
}
