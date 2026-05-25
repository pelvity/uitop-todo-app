'use client';
import React from 'react';
import { Select } from 'antd';
import { useTodos } from '@/context/TodoContext';

export default function CategoryFilter() {
  const { categories, selectedCategoryId, setSelectedCategory } = useTodos();

  const options = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Select
      value={selectedCategoryId}
      onChange={(val) => setSelectedCategory(val as number | 'all')}
      options={options}
      size="large"
      style={{ minWidth: 160 }}
      styles={{ popup: { root: { borderRadius: 12 } } }}
    />
  );
}
