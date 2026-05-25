'use client';
import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  maxLength?: number;
}

export default function HighlightText({ text, query, maxLength = 120 }: HighlightTextProps) {
  if (!query.trim()) {
    if (text.length <= maxLength) return <>{text}</>;
    return <>{text.slice(0, maxLength)}...</>;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const match = regex.exec(text);

  if (!match) {
    if (text.length <= maxLength) return <>{text}</>;
    return <>{text.slice(0, maxLength)}...</>;
  }

  const matchIndex = match.index;
  const matchLength = match[0].length;
  const halfWindow = Math.floor((maxLength - matchLength) / 2);
  let start = Math.max(0, matchIndex - halfWindow);
  let end = Math.min(text.length, matchIndex + matchLength + halfWindow);

  if (start === 0) {
    end = Math.min(text.length, maxLength);
  } else if (end === text.length) {
    start = Math.max(0, text.length - maxLength);
  }

  const prefix = start > 0 ? '...' + text.slice(start, matchIndex) : text.slice(0, matchIndex);
  const highlighted = text.slice(matchIndex, matchIndex + matchLength);
  const suffix = end < text.length ? text.slice(matchIndex + matchLength, end) + '...' : text.slice(matchIndex + matchLength);

  return (
    <span>
      {prefix}
      <mark style={{
        background: '#FFD43B',
        color: '#51463B',
        padding: '0 3px',
        borderRadius: 4,
        fontWeight: 600,
      }}>
        {highlighted}
      </mark>
      {suffix}
    </span>
  );
}
