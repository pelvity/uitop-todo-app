'use client';
import React from 'react';
import { Select, Typography } from 'antd';
import { useTodos } from '@/context/TodoContext';

export default function CategoryFilter() {
  const { categories, selectedCategoryId, setSelectedCategory } = useTodos();

  const options = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Typography.Text strong style={{ fontSize: 14 }}>Filter:</Typography.Text>
      <Select
        value={selectedCategoryId}
        onChange={(val) => setSelectedCategory(val as number | 'all')}
        options={options}
        size="large"
        style={{ minWidth: 180, borderRadius: 12 }}
      />
    </div>
  );
}
