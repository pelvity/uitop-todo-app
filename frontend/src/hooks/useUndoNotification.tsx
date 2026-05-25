'use client';
import { useCallback } from 'react';
import { App, Button } from 'antd';
import { UndoOutlined } from '@ant-design/icons';
import type { Todo } from '@/types';

export function useUndoNotification() {
  const { notification } = App.useApp();

  const showUndoNotification = useCallback(
    (type: 'completed' | 'deleted', todo: Todo, onUndo: () => void) => {
      const key = `undo-${type}-${todo.id}`;

      notification.open({
        key,
        title: type === 'completed' ? '✅ Task completed' : '🗑️ Task deleted',
        description: todo.text.length > 60 ? todo.text.slice(0, 60) + '...' : todo.text,
        duration: 5,
        placement: 'bottomRight',
        showProgress: true,
        pauseOnHover: true,
        actions: [
          <Button
            key="undo"
            type="primary"
            size="small"
            icon={<UndoOutlined />}
            onClick={() => {
              onUndo();
              notification.destroy(key);
            }}
            style={{ borderRadius: 12 }}
          >
            Undo
          </Button>,
        ],
      });
    },
    [notification],
  );

  return { showUndoNotification };
}
