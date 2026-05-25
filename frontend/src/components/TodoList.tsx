'use client';
import React from 'react';
import {
  List, Checkbox, Tag, Button, Typography, Space, Spin, Empty,
  Modal, Skeleton, Card, Flex,
} from 'antd';
import {
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { Todo } from '@/types';
import { useTodos } from '@/context/TodoContext';
import { useUndoNotification } from '@/hooks/useUndoNotification';

const categoryColors: Record<string, string> = {
  Work: 'blue',
  Personal: 'green',
  Shopping: 'orange',
};

export default function TodoList() {
  const {
    todos, loading, error, categories,
    toggleComplete, deleteTodo, fetchTodos,
    selectedTodoIds,
    toggleSelectAll,
    bulkCompleteSelected,
    clearSelection,
    restoreTodo,
    undoDelete,
  } = useTodos();
  const { showUndoNotification } = useUndoNotification();

  const getCategoryName = (categoryId: number): string => {
    return categories.find((c) => c.id === categoryId)?.name ?? 'Unknown';
  };

  const getCategoryColor = (categoryId: number): string => {
    const name = getCategoryName(categoryId);
    return categoryColors[name] || 'default';
  };

  const handleDelete = (todo: Todo) => {
    Modal.confirm({
      title: 'Delete task?',
      content: 'This action can be undone within 5 seconds.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        await deleteTodo(todo.id);
        showUndoNotification('deleted', todo, () => undoDelete(todo));
      },
    });
  };

  if (error) {
    return (
      <Card style={{ borderRadius: 16, textAlign: 'center' }}>
        <Typography.Text type="danger">{error}</Typography.Text>
        <br />
        <Button type="link" onClick={fetchTodos}>Retry</Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card style={{ borderRadius: 16 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (todos.length === 0) {
    return (
      <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}>
        <Empty description="No tasks yet" />
        <Typography.Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          Create your first task above!
        </Typography.Text>
      </Card>
    );
  }

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>📋 Tasks</Typography.Title>}
      style={{ borderRadius: 16 }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
        <Space size="middle">
          <Checkbox
            indeterminate={selectedTodoIds.size > 0 && selectedTodoIds.size < todos.length}
            checked={selectedTodoIds.size === todos.length && todos.length > 0}
            onChange={toggleSelectAll}
          >
            Select All
          </Checkbox>
          {selectedTodoIds.size > 0 && (
            <>
              <Typography.Text type="secondary">
                {selectedTodoIds.size} selected
              </Typography.Text>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={async () => {
                  const ids = Array.from(selectedTodoIds);
                  await bulkCompleteSelected();
                  if (todos[0]) {
                    showUndoNotification('completed', todos[0], () => {
                      ids.forEach((id) => restoreTodo(id));
                    });
                  }
                }}
                style={{ borderRadius: 12 }}
              >
                Complete Selected
              </Button>
              <Button type="link" size="small" onClick={clearSelection}>
                Clear
              </Button>
            </>
          )}
        </Space>
      </Flex>
      <List
        dataSource={todos}
        renderItem={(todo) => (
          <List.Item
            actions={[
              <Button
                key="delete"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(todo)}
                style={{ borderRadius: 12 }}
              />,
            ]}
            style={{
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 4,
              transition: 'all 0.3s ease',
              background: todo.completed ? '#f5f5f5' : 'transparent',
            }}
          >
            <Flex align="center" gap={12} style={{ width: '100%' }}>
              <Checkbox
                checked={todo.completed}
                onChange={async () => {
                  const wasCompleted = todo.completed;
                  await toggleComplete(todo.id, !wasCompleted);
                  if (!wasCompleted) {
                    showUndoNotification('completed', todo, () => restoreTodo(todo.id));
                  }
                }}
              />
              <div style={{ flex: 1 }}>
                <Typography.Text
                  style={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#999' : 'inherit',
                    fontSize: 16,
                  }}
                >
                  {todo.text}
                </Typography.Text>
              </div>
              <Tag
                color={getCategoryColor(todo.categoryId)}
                style={{ borderRadius: 20, marginRight: 0 }}
              >
                {getCategoryName(todo.categoryId)}
              </Tag>
            </Flex>
          </List.Item>
        )}
      />
    </Card>
  );
}
