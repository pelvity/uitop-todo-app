'use client';
import React from 'react';
import { Card, Input, Select, Button, Typography, message, Flex } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTodos } from '@/context/TodoContext';

const schema = z.object({
  text: z.string().min(1, 'Text is required').max(255, 'Max 255 characters'),
  categoryId: z.number({ message: 'Category is required' }).positive('Select a category'),
});

type FormData = z.infer<typeof schema>;

export default function CreateTodoForm() {
  const { categories, createTodo } = useTodos();
  const [loading, setLoading] = React.useState(false);

  const {
    control, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { text: '', categoryId: undefined },
  });

  const textValue = watch('text', '');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await createTodo(data.text, data.categoryId);
      reset();
      message.success({ content: 'Task created!', style: { borderRadius: 12 } });
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        borderRadius: 18,
        marginBottom: 16,
        border: '1px solid #DDE9E4',
        boxShadow: '0 2px 12px rgba(34,85,85,0.07)',
        background: '#FFFFFF',
      }}
      styles={{ body: { padding: '14px 16px' } }}
    >
      <Flex align="center" gap={10} style={{ marginBottom: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: 'linear-gradient(135deg, #1A4444 0%, #225555 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <EditOutlined style={{ color: '#FFFFFF', fontSize: 14 }} />
        </div>
        <Typography.Title level={4} style={{ margin: 0, fontWeight: 800, color: '#1E3A3A', fontSize: 16 }}>
          New Task
        </Typography.Title>
      </Flex>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={10} wrap="wrap">
          <div style={{ flex: 1, minWidth: 200 }}>
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="What needs to be done?"
                  size="large"
                  variant="filled"
                  status={errors.text ? 'error' : undefined}
                  style={{ borderRadius: 12, background: '#F2F7F5' }}
                />
              )}
            />
            <Flex justify="space-between" style={{ marginTop: 3, padding: '0 4px' }}>
              {errors.text ? (
                <Typography.Text type="danger" style={{ fontSize: 12, fontWeight: 600 }}>
                  {errors.text.message}
                </Typography.Text>
              ) : <span />}
              <Typography.Text style={{
                fontSize: 11,
                color: textValue.length > 220 ? '#C86060' : '#A8C0BA',
                fontWeight: 600,
              }}>
                {textValue.length}/255
              </Typography.Text>
            </Flex>
          </div>

          <div style={{ minWidth: 148 }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Category"
                  size="large"
                  variant="filled"
                  style={{ width: '100%', borderRadius: 12 }}
                  status={errors.categoryId ? 'error' : undefined}
                  onChange={(val) => field.onChange(val)}
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                />
              )}
            />
            {errors.categoryId && (
              <Typography.Text type="danger" style={{ fontSize: 12, fontWeight: 600 }}>
                {errors.categoryId.message}
              </Typography.Text>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<PlusOutlined />}
            loading={loading}
            style={{
              minWidth: 130,
              fontWeight: 800,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #1A4444 0%, #225555 100%)',
              border: 'none',
              boxShadow: '0 3px 12px rgba(34,85,85,0.28)',
            }}
          >
            Add Task
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
