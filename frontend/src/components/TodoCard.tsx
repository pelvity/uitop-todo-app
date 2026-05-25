'use client';
import React from 'react';
import { Card, Checkbox, Button, Typography, Flex } from 'antd';
import {
  DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import type { Todo } from '@/types';
import HighlightText from '@/components/HighlightText';

interface TodoCardProps {
  todo: Todo;
  idx: number;
  categoryMeta: { color: string; bg: string; dot: string };
  debouncedSearch: string;
  categoryName: string;
  onToggleComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

const TodoCardComponent = ({
  todo,
  idx,
  categoryMeta,
  debouncedSearch,
  categoryName,
  onToggleComplete,
  onDelete,
}: TodoCardProps) => {
  const isCompleted = todo.completed;

  return (
    <div className="todo-card" style={{ animationDelay: `${idx * 25}ms` }}>
      <div className="todo-card-inner">
        <Card
          size="small"
          style={{
            borderRadius: 14,
            border: isCompleted
              ? '1px solid #EEF0EE'
              : '1px solid #DDE9E4',
            borderLeft: isCompleted
              ? '3px solid #D0D8D4'
              : `3px solid ${categoryMeta.dot}`,
            background: isCompleted ? '#F8FAF9' : '#FFFFFF',
            boxShadow: isCompleted
              ? 'none'
              : '0 1px 4px rgba(34,85,85,0.05), 0 4px 12px rgba(34,85,85,0.05)',
            opacity: isCompleted ? 0.7 : 1,
            transition: 'all 0.22s ease',
          }}
          styles={{ body: { padding: '12px 14px 0' } }}
          actions={[
            <Button
              key="complete"
              type="text"
              size="small"
              icon={isCompleted
                ? <ClockCircleOutlined style={{ color: '#8AADA4' }} />
                : <CheckCircleOutlined style={{ color: '#2E7D4F' }} />
              }
              onClick={() => onToggleComplete(todo)}
              style={{ color: isCompleted ? '#8AADA4' : '#2E7D4F', fontWeight: 700, fontSize: 13 }}
            >
              {isCompleted ? 'Reopen' : 'Complete'}
            </Button>,
            <Button
              key="delete"
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(todo)}
              style={{ color: '#C86060', fontWeight: 700, fontSize: 13 }}
            >
              Delete
            </Button>,
          ]}
        >
          <Flex gap={10} align="flex-start">
            <Checkbox
              checked={isCompleted}
              onChange={() => onToggleComplete(todo)}
              style={{ marginTop: 2 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{
                textDecoration: isCompleted ? 'line-through' : 'none',
                color: isCompleted ? '#A8BAB4' : '#1E3A3A',
                fontSize: 14,
                fontWeight: isCompleted ? 500 : 700,
                transition: 'all 0.25s ease',
                display: 'block',
                lineHeight: 1.45,
                wordBreak: 'break-word',
              }}>
                <HighlightText text={todo.text} query={debouncedSearch} maxLength={100} />
              </Typography.Text>
              <Flex align="center" gap={6} style={{ marginTop: 6, marginBottom: 2 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: isCompleted ? '#C8D8D0' : categoryMeta.dot,
                  display: 'inline-block', flexShrink: 0,
                }} />
                <Typography.Text style={{
                  fontSize: 12, fontWeight: 700,
                  color: isCompleted ? '#A8BAB4' : categoryMeta.color,
                }}>
                  {categoryName}
                </Typography.Text>
              </Flex>
            </div>
          </Flex>
        </Card>
      </div>
    </div>
  );
};

export const TodoCard = React.memo(TodoCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.completed === nextProps.todo.completed &&
    prevProps.todo.text === nextProps.todo.text &&
    prevProps.todo.categoryId === nextProps.todo.categoryId &&
    prevProps.debouncedSearch === nextProps.debouncedSearch &&
    prevProps.categoryName === nextProps.categoryName &&
    prevProps.categoryMeta.dot === nextProps.categoryMeta.dot &&
    prevProps.categoryMeta.color === nextProps.categoryMeta.color
  );
});

TodoCard.displayName = 'TodoCard';
