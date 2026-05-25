'use client';
import React, { useState, useEffect } from 'react';
import {
  Button, Drawer, Timeline, Typography, Spin, Empty, Tag, Flex, Badge, Tooltip, Modal, message,
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

export default function HistorySidebar() {
  const { logs, loading, error, refresh } = useActionLogs();
  const { todos, fetchTodos } = useTodos();
  const [open, setOpen] = useState(false);
  const [lastViewedAt, setLastViewedAt] = useState<number>(() => Date.now());

  // Refetch logs when todos change to keep history sidebar and badge up-to-date
  useEffect(() => {
    refresh();
  }, [todos, refresh]);

  const unseenCount = logs.filter((log) => {
    const time = new Date(log.createdAt).getTime();
    return time > lastViewedAt;
  }).length;

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

  return (
    <>
      <Tooltip title="View action history">
        <Badge count={unseenCount} size="small" offset={[-8, 4]} style={{ background: '#2E7D4F' }}>
          <Button
            type="text"
            size="large"
            icon={<HistoryOutlined />}
            onClick={() => {
              setOpen(true);
              setLastViewedAt(Date.now());
            }}
            className="history-btn"
            style={{ borderRadius: 12, fontSize: 16, fontWeight: 500 }}
          >
            History
          </Button>
        </Badge>
      </Tooltip>
      <Drawer
        title={
          <Flex align="center" gap={8}>
            <HistoryOutlined style={{ color: '#1A4444' }} />
            <span>Action History</span>
          </Flex>
        }
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        size="large"
        extra={
          <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading} size="small" style={{ borderRadius: 12 }}>
            Refresh
          </Button>
        }
        footer={
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Total: {logs.length} actions
          </Typography.Text>
        }
        style={{
          borderTop: '4px solid #1A4444',
        }}
      >
        {loading && logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
        ) : error ? (
          <Typography.Text type="danger">{error}</Typography.Text>
        ) : logs.length === 0 ? (
          <Empty description="No actions recorded yet" />
        ) : (
          <Timeline
            items={logs.map((log) => {
              const config = actionConfig[log.action] || { color: 'gray', icon: null };
              return {
                color: config.color,
                dot: config.icon,
                content: (
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
                        <Tag style={{ borderRadius: 12, fontSize: 11, margin: 0 }}>{log.categoryName}</Tag>
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
        )}
      </Drawer>
    </>
  );
}
