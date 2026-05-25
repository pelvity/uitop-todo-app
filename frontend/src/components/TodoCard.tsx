'use client';
import React from 'react';
import { Card, Checkbox, Button, Typography, Flex, Tag } from 'antd';
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
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onToggleComplete: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

const TodoCardComponent = ({
  todo,
  idx,
  categoryMeta,
  debouncedSearch,
  categoryName,
  isSelected,
  onToggleSelect,
  onToggleComplete,
  onDelete,
}: TodoCardProps) => {
  const isCompleted = todo.completed;

  return (
    <div className="todo-card" style={{ animationDelay: `${idx * 25}ms`, transition: 'transform 0.2s', transform: isCompleted ? 'scale(0.98)' : 'scale(1)' }}>
      <div className="todo-card-inner">
        <Card
          size="small"
          style={{
            borderRadius: 16,
            border: '2px solid #225555',
            background: isCompleted ? '#E0ECEB' : categoryMeta.bg,
            boxShadow: isCompleted
              ? 'none'
              : '4px 4px 0px 0px #225555',
            opacity: isCompleted ? 0.8 : 1,
            transition: 'all 0.22s ease',
          }}
          styles={{ body: { padding: '16px' } }}
          actions={[
            <Button
              key="complete"
              type="text"
              size="small"
              icon={isCompleted
                ? <ClockCircleOutlined style={{ color: '#51463B' }} />
                : <CheckCircleOutlined style={{ color: '#225555' }} />
              }
              onClick={() => onToggleComplete(todo)}
              style={{ color: isCompleted ? '#51463B' : '#225555', fontWeight: 900, fontSize: 14 }}
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
              style={{ color: '#DA8787', fontWeight: 900, fontSize: 14 }}
            >
              Delete
            </Button>,
          ]}
        >
          <Flex gap={12} align="flex-start">
            <Checkbox
              checked={isSelected}
              onChange={() => onToggleSelect(todo.id)}
              style={{ marginTop: 2, transform: 'scale(1.2)' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Text style={{
                textDecoration: isCompleted ? 'line-through' : 'none',
                color: isCompleted ? '#8AADA4' : '#225555',
                fontSize: 16,
                fontWeight: isCompleted ? 700 : 900,
                transition: 'all 0.25s ease',
                display: 'block',
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}>
                <HighlightText text={todo.text} query={debouncedSearch} maxLength={100} />
              </Typography.Text>
              <Flex align="center" gap={6} style={{ marginTop: 12, flexWrap: 'wrap' }}>
                <Tag style={{
                  borderRadius: 24, margin: 0, fontWeight: 900, fontSize: 12,
                  background: isCompleted ? '#C8DAD4' : '#FFFFFF', color: '#51463B',
                  border: '2px solid #225555', padding: '0 10px',
                  boxShadow: '1px 1px 0px 0px #225555'
                }}>
                  {categoryName}
                </Tag>
                {todo.tags?.map((t) => (
                  <Tag key={t} style={{
                    borderRadius: 24, margin: 0, fontWeight: 700, fontSize: 11,
                    background: isCompleted ? '#E8D4C8' : '#F0C973', color: '#51463B',
                    border: '2px solid #225555', padding: '0 8px',
                  }}>
                    #{t}
                  </Tag>
                ))}
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
    prevProps.todo.tags?.join(',') === nextProps.todo.tags?.join(',') &&
    prevProps.debouncedSearch === nextProps.debouncedSearch &&
    prevProps.categoryName === nextProps.categoryName &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.categoryMeta.dot === nextProps.categoryMeta.dot &&
    prevProps.categoryMeta.color === nextProps.categoryMeta.color
  );
});

TodoCard.displayName = 'TodoCard';
