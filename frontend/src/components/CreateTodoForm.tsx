'use client';
import React from 'react';
import { Card, Input, Select, Button, Typography, message, Flex, Tag } from 'antd';
import { PlusOutlined, EditOutlined, SettingOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTodos } from '@/context/TodoContext';
import CategoryManager from '@/components/CategoryManager';

const schema = z.object({
  text: z.string().min(1, 'Text is required').max(255, 'Max 255 characters'),
  categoryId: z.number({ message: 'Category is required' }).positive('Select a category'),
});

type FormData = z.infer<typeof schema>;

export default function CreateTodoForm() {
  const { categories, tags, createTodo } = useTodos();
  const [loading, setLoading] = React.useState(false);
  const [tagsInput, setTagsInput] = React.useState<string[]>([]);
  const [catManagerOpen, setCatManagerOpen] = React.useState(false);

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
      await createTodo(data.text, data.categoryId, tagsInput);
      reset();
      setTagsInput([]);
      message.success({ content: 'Task created!', style: { borderRadius: 12, border: '2px solid #225555' } });
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        borderRadius: 20,
        marginBottom: 24,
        border: '2px solid #225555',
        boxShadow: '6px 6px 0px 0px #225555',
        background: '#FFFFFF',
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: '#F0C973',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid #225555',
          boxShadow: '2px 2px 0px 0px #225555',
          transform: 'rotate(5deg)',
        }}>
          <EditOutlined style={{ color: '#51463B', fontSize: 18 }} />
        </div>
        <Typography.Title level={4} style={{ margin: 0, fontWeight: 900, color: '#51463B', fontSize: 18 }}>
          New Task
        </Typography.Title>
      </Flex>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex gap={12} wrap="wrap">
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
                  style={{ borderRadius: 14, border: '2px solid #225555' }}
                />
              )}
            />
            <Flex justify="space-between" style={{ marginTop: 6, padding: '0 4px' }}>
              {errors.text ? (
                <Typography.Text type="danger" style={{ fontSize: 13, fontWeight: 800 }}>
                  {errors.text.message}
                </Typography.Text>
              ) : <span />}
              <Typography.Text style={{
                fontSize: 12,
                color: textValue.length > 220 ? '#DA8787' : '#51463B',
                fontWeight: 800,
              }}>
                {textValue.length}/255
              </Typography.Text>
            </Flex>
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
                  style={{ width: '100%', borderRadius: 14 }}
                  status={errors.categoryId ? 'error' : undefined}
                  onChange={(val) => field.onChange(val)}
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                />
              )}
            />
              {errors.categoryId && (
              <Typography.Text type="danger" style={{ fontSize: 13, fontWeight: 800, display: 'block', marginTop: 6 }}>
                {errors.categoryId.message}
              </Typography.Text>
            )}
            <Button
              type="link"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setCatManagerOpen(true)}
              style={{
                marginTop: 8, padding: 0, fontWeight: 900, color: '#51463B',
                fontSize: 13,
              }}
            >
              Manage categories
            </Button>
          </div>

          <div style={{ minWidth: 160 }}>
            <Select
              id="tags-input"
              mode="tags"
              placeholder="Add tags..."
              size="large"
              style={{ width: '100%', borderRadius: 14 }}
              value={tagsInput}
              onChange={setTagsInput}
              tokenSeparators={[',', ' ', ';']}
              options={tags.map((t) => ({ label: t.name, value: t.name }))}
              tagRender={(props) => (
                <Tag
                  closable={props.closable}
                  onClose={props.onClose}
                  style={{
                    borderRadius: 24, fontWeight: 900, fontSize: 12,
                    background: '#F0C973', color: '#51463B',
                    border: '2px solid #225555', margin: '2px 4px 2px 0',
                    padding: '0 8px',
                  }}
                >
                  {props.label}
                </Tag>
              )}
            />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            icon={<PlusOutlined />}
            loading={loading}
            style={{
              minWidth: 140,
              fontWeight: 900,
              borderRadius: 24,
              background: '#9AD69A',
              color: '#51463B',
              border: '2px solid #225555',
              boxShadow: '3px 3px 0px 0px #225555',
            }}
          >
            Add Task
          </Button>
        </Flex>
      </form>
      <CategoryManager open={catManagerOpen} onClose={() => setCatManagerOpen(false)} />
    </Card>
  );
}
