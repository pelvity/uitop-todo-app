'use client';
import React from 'react';
import {
  Button, Timeline, Typography, Spin, Empty, Tag, Flex, Modal, message, Card,
} from 'antd';
import {
  HistoryOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  UndoOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useActionLogs } from '@/hooks/useActionLogs';
import { useTodos } from '@/context/TodoContext';
import * as api from '@/lib/api';
import type { ActionLog } from '@/types';

const actionConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  created: { color: 'green', icon: <PlusCircleOutlined /> },
  completed: { color: 'blue', icon: <CheckCircleOutlined /> },
  uncompleted: { color: 'orange', icon: <UndoOutlined /> },
  deleted: { color: 'red', icon: <DeleteOutlined /> },
  restored: { color: 'orange', icon: <UndoOutlined /> },
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function HistoryPage() {
  const { logs, loading, error, refresh } = useActionLogs();
  const { todos, fetchTodos } = useTodos();

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos]);

  const performUndo = async (log: ActionLog) => {
    try {
      const res = await api.undoActionLog(log.id);
      message.success(res.message);
      refresh();
      await fetchTodos();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Undo failed');
    }
  };

  const handleUndoClick = (log: ActionLog) => {
    if (log.action === 'deleted') {
      Modal.confirm({
        title: 'Undo deletion?',
        content: `This will recreate the task "${log.todoText}". Continue?`,
        okText: 'Recreate',
        cancelText: 'Cancel',
        onOk: () => performUndo(log),
      });
    } else {
      performUndo(log);
    }
  };

  const content = () => {
    if (loading && logs.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <Card
          style={{
            borderRadius: 20, border: '3px solid #225555',
            boxShadow: '6px 6px 0px 0px #225555',
          }}
        >
          <Typography.Text type="danger">{error}</Typography.Text>
        </Card>
      );
    }

    if (logs.length === 0) {
      return (
        <Card
          style={{
            borderRadius: 20, border: '3px solid #225555',
            boxShadow: '6px 6px 0px 0px #225555',
          }}
        >
          <Empty description="No actions recorded yet" />
        </Card>
      );
    }

    return (
      <Card
        style={{
          borderRadius: 20, border: '3px solid #225555',
          boxShadow: '6px 6px 0px 0px #225555',
          background: '#FFFFFF',
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Timeline
          items={logs.map((log) => {
            const config = actionConfig[log.action] || { color: 'gray', icon: null };
            return {
              color: config.color,
              dot: config.icon,
              children: (
                <>
                  <Typography.Text strong style={{ color: '#1E3A3A' }}>
                    {log.action === 'created' && `Created "${log.todoText}"`}
                    {log.action === 'completed' && `Completed "${log.todoText}"`}
                    {log.action === 'uncompleted' && `Uncompleted "${log.todoText}"`}
                    {log.action === 'deleted' && `Deleted "${log.todoText}"`}
                    {log.action === 'restored' && `Restored "${log.todoText}"`}
                  </Typography.Text>
                  <br />
                  <Flex gap={8} align="center" style={{ marginTop: 4 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {formatTime(log.createdAt)}
                    </Typography.Text>
                    {log.categoryName && (
                      <Tag
                        style={{
                          borderRadius: 12, fontSize: 11, margin: 0,
                          border: '2px solid #225555', fontWeight: 700,
                        }}
                      >
                        {log.categoryName}
                      </Tag>
                    )}
                    {log.action !== 'restored' && (
                      <Button
                        type="link"
                        size="small"
                        icon={<UndoOutlined />}
                        onClick={() => handleUndoClick(log)}
                        style={{
                          padding: '0 4px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: log.action === 'deleted' ? '#C86060' : log.action === 'completed' ? '#3A80D9' : '#2E7D4F',
                        }}
                      >
                        Undo
                      </Button>
                    )}
                  </Flex>
                </>
              ),
            };
          })}
        />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
            Total: {logs.length} actions
          </Typography.Text>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ maxWidth: 880, width: '100%', margin: '0 auto', padding: '0 16px 100px' }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 20 }}>
        <Flex align="center" gap={10}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#225555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #225555',
            boxShadow: '2px 2px 0px 0px #51463B',
          }}>
            <HistoryOutlined style={{ color: '#FAFAEE', fontSize: 18 }} />
          </div>
          <Typography.Title level={4} style={{
            margin: 0, color: '#225555',
            fontSize: 20, fontWeight: 900,
            fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
          }}>
            Action History
          </Typography.Title>
        </Flex>
        <Button
          icon={<ReloadOutlined />}
          onClick={refresh}
          loading={loading}
          style={{
            borderRadius: 12, fontWeight: 700,
            border: '2px solid #225555',
            boxShadow: '2px 2px 0px 0px #225555',
          }}
        >
          Refresh
        </Button>
      </Flex>

      {content()}
    </div>
  );
}
