'use client';
import { useState, useCallback, useEffect } from 'react';
import type { ActionLog } from '@/types';
import * as api from '@/lib/api';

export function useActionLogs(limit: number = 50) {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getActionLogs(limit);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { logs, loading, error, refresh };
}
