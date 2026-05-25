'use client';
import React from 'react';
import { Card, Input, Select, Button, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { text: '', categoryId: undefined },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await createTodo(data.text, data.categoryId);
      reset();
      message.success('Task created!');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>✨ New Task</Typography.Title>}
      style={{ borderRadius: 16, marginBottom: 16 }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="What needs to be done?"
                  size="large"
                  status={errors.text ? 'error' : undefined}
                  style={{ borderRadius: 12 }}
                />
              )}
            />
            {errors.text && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
                {errors.text.message}
              </Typography.Text>
            )}
          </div>

          <div style={{ minWidth: 160 }}>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Category"
                  size="large"
                  style={{ width: '100%', borderRadius: 12 }}
                  status={errors.categoryId ? 'error' : undefined}
                  onChange={(val) => field.onChange(val)}
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                />
              )}
            />
            {errors.categoryId && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
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
            style={{ borderRadius: 24 }}
          >
            Add Task
          </Button>
        </div>
      </form>
    </Card>
  );
}
