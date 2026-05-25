'use client';
import React from 'react';
import {
  Row, Col, Card, Checkbox, Tag, Button, Typography, Space,
  Modal, Skeleton, Flex,
} from 'antd';
import {
  DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SearchOutlined, FlagOutlined,
} from '@ant-design/icons';
import type { Todo } from '@/types';
import { useTodos } from '@/context/TodoContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useUndoNotification } from '@/hooks/useUndoNotification';
import HighlightText from '@/components/HighlightText';

import { TodoCard } from '@/components/TodoCard';

const categoryMeta: Record<string, { color: string; bg: string; dot: string }> = {
  Work:     { color: '#1A5C8A', bg: '#E6F2FB', dot: '#3A9AD9' },
  Personal: { color: '#2E6E3E', bg: '#E6F5EC', dot: '#4DBF6E' },
  Shopping: { color: '#8A4E18', bg: '#FEF2E6', dot: '#E8923A' },
};
const fallbackMeta = { color: '#5058A0', bg: '#EEEEF8', dot: '#8088D4' };

export default function TodoList() {
  const {
    todos, loading, error, categories, searchQuery,
    toggleComplete, deleteTodo, fetchTodos,
    selectedTodoIds, toggleSelectAll, bulkCompleteSelected,
    clearSelection, restoreTodo, undoDelete, toggleSelectTodo,
  } = useTodos();
  const { showUndoNotification } = useUndoNotification();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const getCategoryName = React.useCallback((categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.name ?? 'Unknown', [categories]);

  const getCategoryMeta = React.useCallback((categoryId: number) => {
    const name = getCategoryName(categoryId);
    return categoryMeta[name] || fallbackMeta;
  }, [getCategoryName]);

  const handleDelete = React.useCallback((todo: Todo) => {
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
  }, [deleteTodo, showUndoNotification, undoDelete]);

  const handleToggleComplete = React.useCallback(async (todo: Todo) => {
    const wasCompleted = todo.completed;
    await toggleComplete(todo.id, !wasCompleted);
    if (!wasCompleted) {
      showUndoNotification('completed', todo, () => restoreTodo(todo.id));
    }
  }, [toggleComplete, showUndoNotification, restoreTodo]);

  const filteredTodos = React.useMemo(() => {
    if (!debouncedSearch.trim()) return todos;
    const q = debouncedSearch.toLowerCase();
    return todos.filter((t) => t.text.toLowerCase().includes(q));
  }, [todos, debouncedSearch]);

  if (error) {
    return (
      <Card style={{ borderRadius: 18, textAlign: 'center', border: 'none' }}>
        <Typography.Text type="danger">{error}</Typography.Text>
        <br />
        <Button type="link" onClick={fetchTodos}>Retry</Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card style={{ borderRadius: 18, border: 'none', boxShadow: '0 2px 16px rgba(34,85,85,0.07)' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (filteredTodos.length === 0) {
    return (
      <Card style={{
        borderRadius: 18, textAlign: 'center', padding: 40,
        border: '1px solid #DDE9E4',
        boxShadow: '0 2px 12px rgba(34,85,85,0.06)',
      }}>
        {debouncedSearch ? (
          <>
            <SearchOutlined style={{ fontSize: 38, color: '#8AADA4', marginBottom: 12 }} />
            <Typography.Text type="secondary" style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>
              No tasks match &quot;{debouncedSearch}&quot;
            </Typography.Text>
          </>
        ) : (
          <>
            <FlagOutlined style={{ fontSize: 38, color: '#B8CFC8', marginBottom: 12 }} />
            <Typography.Text strong style={{ display: 'block', fontSize: 15, color: '#3A6060' }}>
              No tasks yet
            </Typography.Text>
            <Typography.Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
              Add your first task above!
            </Typography.Text>
          </>
        )}
      </Card>
    );
  }

  return (
    <Card style={{
      borderRadius: 18,
      marginTop: 0,
      border: '1px solid #DDE9E4',
      boxShadow: '0 2px 12px rgba(34,85,85,0.06)',
    }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Flex align="center" gap={10}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(135deg, #1A4444 0%, #225555 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FlagOutlined style={{ color: '#FFFFFF', fontSize: 14 }} />
          </div>
          <Typography.Title level={4} style={{ margin: 0, fontWeight: 800, color: '#1E3A3A', fontSize: 16 }}>
            Tasks
          </Typography.Title>
          <Tag style={{
            borderRadius: 20, margin: 0, fontWeight: 800, fontSize: 12,
            background: '#225555', color: '#FFFFFF', border: 'none',
            padding: '0 8px', lineHeight: '22px',
          }}>
            {filteredTodos.length}
          </Tag>
        </Flex>
        <Space size="middle">
          <Checkbox
            indeterminate={selectedTodoIds.size > 0 && selectedTodoIds.size < filteredTodos.length}
            checked={selectedTodoIds.size === filteredTodos.length && filteredTodos.length > 0}
            onChange={toggleSelectAll}
          >
            <Typography.Text style={{ fontSize: 13, color: '#6A8A84', fontWeight: 600 }}>Select All</Typography.Text>
          </Checkbox>
          {selectedTodoIds.size > 0 && (
            <>
              <Typography.Text style={{ color: '#225555', fontWeight: 700, fontSize: 13 }}>
                {selectedTodoIds.size} selected
              </Typography.Text>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={async () => {
                  const ids = Array.from(selectedTodoIds);
                  await bulkCompleteSelected();
                  if (filteredTodos[0]) {
                    showUndoNotification('completed', filteredTodos[0], () => {
                      ids.forEach((id) => restoreTodo(id));
                    });
                  }
                }}
                style={{ borderRadius: 20, fontWeight: 700, fontSize: 13 }}
              >
                Complete
              </Button>
              <Button type="link" size="small" onClick={clearSelection} style={{ color: '#C86060', fontWeight: 700, padding: 0 }}>
                Clear
              </Button>
            </>
          )}
        </Space>
      </Flex>

      <Row gutter={[12, 12]}>
        {filteredTodos.map((todo, idx) => (
          <Col xs={24} sm={12} key={todo.id}>
            <TodoCard
              todo={todo}
              idx={idx}
              categoryMeta={getCategoryMeta(todo.categoryId)}
              debouncedSearch={debouncedSearch}
              categoryName={getCategoryName(todo.categoryId)}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
}
