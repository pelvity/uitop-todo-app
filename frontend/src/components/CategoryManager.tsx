'use client';
import React, { useState } from 'react';
import { Modal, Input, Button, List, Flex, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTodos } from '@/context/TodoContext';

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function CategoryManager({ open, onClose }: CategoryManagerProps) {
  const { categories, createCategory, updateCategory, deleteCategory, fetchCategories } = useTodos();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await createCategory(newName.trim());
      setNewName('');
      message.success('Category added');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const handleRename = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      await updateCategory(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
      message.success('Category renamed');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to rename category');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success('Category deleted');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const startEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Modal
      title="Manage Categories"
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      destroyOnHidden
    >
      <Flex vertical gap={12}>
        <Flex gap={8}>
          <Input
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={handleAdd}
            style={{ borderRadius: 10, border: '2px solid #225555' }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            loading={adding}
            style={{
              fontWeight: 900, borderRadius: 10, background: '#9AD69A',
              color: '#51463B', border: '2px solid #225555',
              boxShadow: '2px 2px 0px 0px #225555',
            }}
          >
            Add
          </Button>
        </Flex>

        <List
          dataSource={categories}
          locale={{ emptyText: 'No categories yet' }}
          renderItem={(cat) => (
            <List.Item
              style={{ borderRadius: 10, border: '1px solid #e8e8e8', padding: '8px 12px', marginBottom: 4 }}
              actions={
                editingId === cat.id
                  ? [
                    <Button key="save" type="text" icon={<CheckOutlined />} onClick={() => handleRename(cat.id)} />,
                    <Button key="cancel" type="text" icon={<CloseOutlined />} onClick={cancelEdit} />,
                  ]
                  : [
                    <Button key="edit" type="text" size="small" icon={<EditOutlined />} onClick={() => startEdit(cat.id, cat.name)} />,
                    <Popconfirm key="delete" title="Delete category?" description="Only empty categories can be deleted" onConfirm={() => handleDelete(cat.id)} okText="Delete" cancelText="Cancel">
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]
              }
            >
              {editingId === cat.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onPressEnter={() => handleRename(cat.id)}
                  style={{ borderRadius: 8, border: '2px solid #225555' }}
                  autoFocus
                />
              ) : (
                <Typography.Text strong style={{ color: '#51463B' }}>{cat.name}</Typography.Text>
              )}
            </List.Item>
          )}
        />
      </Flex>
    </Modal>
  );
}
