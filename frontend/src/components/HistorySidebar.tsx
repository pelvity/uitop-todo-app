'use client';
import React, { useState } from 'react';
import {
  Button, Drawer, Timeline, Typography, Space, Spin, Empty, Tag, Flex,
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="text"
        size="large"
        icon={<HistoryOutlined />}
        onClick={() => setOpen(true)}
        style={{ borderRadius: 12, fontSize: 16, fontWeight: 500 }}
      >
        History
      </Button>
      <Drawer
        title="Action History"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={400}
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
                children: (
                  <>
                    <Typography.Text strong>
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
