'use client';
import React, { useState } from 'react';
import {
  Row, Col, Card, Checkbox, Tag, Button, Typography,
  Modal, Skeleton, Flex, Input,
} from 'antd';
import {
  DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined,
  SearchOutlined, FlagOutlined, SmileOutlined, InboxOutlined,
} from '@ant-design/icons';
import type { Todo } from '@/types';
import { useTodos } from '@/context/TodoContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useUndoNotification } from '@/hooks/useUndoNotification';
import HighlightText from '@/components/HighlightText';
import CategoryFilter from '@/components/CategoryFilter';

import { TodoCard } from '@/components/TodoCard';

const categoryMeta: Record<string, { color: string; bg: string; dot: string }> = {
  Work:     { color: '#51463B', bg: '#9CD3D3', dot: '#225555' },
  Personal: { color: '#51463B', bg: '#9AD69A', dot: '#225555' },
  Shopping: { color: '#51463B', bg: '#F0C973', dot: '#225555' },
};
const fallbackMeta = { color: '#51463B', bg: '#E0ECEB', dot: '#225555' };

export default function TodoList() {
  const {
    todos, loading, error, categories, searchQuery, setSearchQuery,
    toggleComplete, deleteTodo, fetchTodos,
    selectedTodoIds, toggleSelectAll, bulkCompleteSelected,
    clearSelection, restoreTodo, undoDelete, toggleSelectTodo,
  } = useTodos();
  const { showUndoNotification } = useUndoNotification();
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const progressPercent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

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

  const searchFiltered = React.useMemo(() => {
    if (!debouncedSearch.trim()) return todos;
    const q = debouncedSearch.toLowerCase();
    return todos.filter((t) => {
      if (t.text.toLowerCase().includes(q)) return true;
      if (t.tags?.some((tag) => tag.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [todos, debouncedSearch]);

  const uniqueTags = React.useMemo(() => {
    const set = new Set<string>();
    for (const t of searchFiltered) {
      t.tags?.forEach((tag) => set.add(tag));
    }
    return Array.from(set).sort();
  }, [searchFiltered]);

  const filteredTodos = React.useMemo(() => {
    if (!selectedTag) return searchFiltered;
    return searchFiltered.filter((t) => t.tags?.includes(selectedTag));
  }, [searchFiltered, selectedTag]);

  if (error) {
    return (
      <Card style={{ borderRadius: 20, textAlign: 'center', border: '2px solid #225555' }}>
        <Typography.Text type="danger" style={{ fontWeight: 800 }}>{error}</Typography.Text>
        <br />
        <Button type="link" onClick={fetchTodos} style={{ fontWeight: 800 }}>Retry</Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card style={{ borderRadius: 20, border: '2px solid #225555', boxShadow: '6px 6px 0px 0px #225555' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (filteredTodos.length === 0 && !debouncedSearch && !selectedTag) {
    return (
      <Card style={{
        borderRadius: 20,
        border: '2px solid #225555',
        boxShadow: '6px 6px 0px 0px #225555',
        background: '#FAFAEE',
      }}>
        <div style={{ marginBottom: 16 }}>
          <Flex gap={12} wrap="wrap" style={{ marginBottom: 12 }}>
            <Input
              size="large"
              placeholder="Search tasks..."
              prefix={<SearchOutlined style={{ color: '#225555' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              variant="outlined"
              style={{ flex: 1, minWidth: 200, borderRadius: 14, border: '2px solid #225555', height: 44, fontWeight: 800 }}
            />
            <CategoryFilter />
          </Flex>
          <Flex align="center" gap={10} wrap="wrap" style={{ marginBottom: 8 }}>
            <Tag icon={<InboxOutlined />} style={{
              borderRadius: 24, padding: '2px 12px', fontSize: 13,
              background: '#9CD3D3', color: '#225555', border: '2px solid #225555', fontWeight: 900, margin: 0,
              boxShadow: '2px 2px 0px 0px #225555',
            }}>
              &nbsp;0 total
            </Tag>
            <Tag icon={<CheckCircleOutlined />} style={{
              borderRadius: 24, padding: '2px 12px', fontSize: 13,
              background: '#9AD69A', color: '#225555', border: '2px solid #225555', fontWeight: 900, margin: 0,
              boxShadow: '2px 2px 0px 0px #225555',
            }}>
              &nbsp;0 done
            </Tag>
          </Flex>
        </div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <SmileOutlined style={{ fontSize: 48, color: '#9CD3D3', marginBottom: 16 }} />
          <Typography.Title level={4} style={{ display: 'block', color: '#51463B', fontWeight: 900 }}>
            You are all caught up!
          </Typography.Title>
          <Typography.Text style={{ marginTop: 8, display: 'block', fontSize: 16, fontWeight: 700, color: '#51463B' }}>
            Add a new task above to get started.
          </Typography.Text>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{
      borderRadius: 20,
      marginTop: 0,
      border: '2px solid #225555',
      boxShadow: '6px 6px 0px 0px #225555',
      background: '#FAFAEE',
    }}>
      <div style={{ marginBottom: 16 }}>
        <Flex align="center" gap={12}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #225555',
            boxShadow: '2px 2px 0px 0px #225555',
            transform: 'rotate(-5deg)',
          }}>
            <FlagOutlined style={{ color: '#51463B', fontSize: 18 }} />
          </div>
          <Typography.Title level={4} style={{ margin: 0, fontWeight: 900, color: '#51463B', fontSize: 18 }}>
            Tasks
          </Typography.Title>
          <Tag style={{
            borderRadius: 24, margin: 0, fontWeight: 900, fontSize: 14,
            background: '#225555', color: '#FFFFFF', border: 'none',
            padding: '2px 10px', lineHeight: '22px',
          }}>
            {filteredTodos.length}
          </Tag>
        </Flex>

        <Flex gap={12} wrap="wrap" style={{ marginTop: 16, marginBottom: 12 }}>
          <Input
            size="large"
            placeholder="Search tasks..."
            prefix={<SearchOutlined style={{ color: '#225555' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            variant="outlined"
            style={{ flex: 1, minWidth: 200, borderRadius: 14, border: '2px solid #225555', height: 44, fontWeight: 800 }}
          />
          <CategoryFilter />
        </Flex>

        <Flex align="center" gap={10} wrap="wrap" style={{ marginBottom: 14 }}>
          <Tag icon={<InboxOutlined />} style={{
            borderRadius: 24, padding: '2px 12px', fontSize: 13,
            background: '#9CD3D3', color: '#225555', border: '2px solid #225555', fontWeight: 900, margin: 0,
            boxShadow: '2px 2px 0px 0px #225555',
          }}>
            &nbsp;{totalTodos} total
          </Tag>
          <Tag icon={<CheckCircleOutlined />} style={{
            borderRadius: 24, padding: '2px 12px', fontSize: 13,
            background: '#9AD69A', color: '#225555', border: '2px solid #225555', fontWeight: 900, margin: 0,
            boxShadow: '2px 2px 0px 0px #225555',
          }}>
            &nbsp;{completedTodos} done
          </Tag>
          {activeTodos > 0 && (
            <Tag style={{
              borderRadius: 24, padding: '2px 12px', fontSize: 13,
              background: '#F0C973', color: '#51463B', border: '2px solid #225555', fontWeight: 900, margin: 0,
              boxShadow: '2px 2px 0px 0px #225555',
            }}>
              {activeTodos} active
            </Tag>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <Typography.Text style={{ fontSize: 14, fontWeight: 900, color: '#225555' }}>
              {progressPercent}% complete
            </Typography.Text>
          </div>
        </Flex>

        {uniqueTags.length > 0 && (
          <Flex gap={6} wrap="wrap" style={{ marginTop: 12, marginBottom: 4 }}>
            <Tag
              onClick={() => setSelectedTag(null)}
              style={{
                borderRadius: 24, margin: 0, fontWeight: 900, fontSize: 12, cursor: 'pointer',
                padding: '2px 12px', lineHeight: '24px',
                border: '2px solid #225555',
                background: selectedTag === null ? '#225555' : '#FFFFFF',
                color: selectedTag === null ? '#FAFAEE' : '#51463B',
                transition: 'all 0.15s',
              }}
            >
              All Tags
            </Tag>
            {uniqueTags.map((tag) => (
              <Tag
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                style={{
                  borderRadius: 24, margin: 0, fontWeight: 900, fontSize: 12, cursor: 'pointer',
                  padding: '2px 12px', lineHeight: '24px',
                  border: '2px solid #225555',
                  background: selectedTag === tag ? '#F0C973' : '#FFFFFF',
                  color: '#51463B',
                  transition: 'all 0.15s',
                }}
              >
                #{tag}
              </Tag>
            ))}
          </Flex>
        )}
        <div style={{ marginTop: 10 }}>
          <Flex gap={8} align="center" wrap="wrap">
            <Checkbox
              indeterminate={selectedTodoIds.size > 0 && selectedTodoIds.size < filteredTodos.length}
              checked={selectedTodoIds.size === filteredTodos.length && filteredTodos.length > 0}
              onChange={toggleSelectAll}
            >
              <Typography.Text style={{ fontSize: 14, color: '#51463B', fontWeight: 800 }}>Select All</Typography.Text>
            </Checkbox>
            {selectedTodoIds.size > 0 && (
              <>
                <Typography.Text style={{ color: '#225555', fontWeight: 900, fontSize: 14 }}>
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
                  style={{ borderRadius: 20, fontWeight: 900, fontSize: 13, border: '2px solid #225555' }}
                >
                  Complete
                </Button>
                <Button type="link" size="small" onClick={clearSelection} style={{ color: '#DA8787', fontWeight: 900, padding: 0 }}>
                  Clear
                </Button>
              </>
            )}
          </Flex>
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <SearchOutlined style={{ fontSize: 48, color: '#225555', marginBottom: 16 }} />
          <Typography.Text type="secondary" style={{ display: 'block', fontSize: 18, fontWeight: 800, color: '#51463B' }}>
            No tasks match{debouncedSearch ? ` "${debouncedSearch}"` : ''}{selectedTag ? ` #${selectedTag}` : ''}
          </Typography.Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTodos.map((todo, idx) => (
            <Col xs={24} sm={12} key={todo.id}>
              <TodoCard
                todo={todo}
                idx={idx}
                categoryMeta={getCategoryMeta(todo.categoryId)}
                debouncedSearch={debouncedSearch}
                categoryName={getCategoryName(todo.categoryId)}
                isSelected={selectedTodoIds.has(todo.id)}
                onToggleSelect={toggleSelectTodo}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
}
