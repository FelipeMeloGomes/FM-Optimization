import { useCallback, useEffect, useRef, useState } from 'react';
import type { CleanerStats } from '../../electron/shared/ipc-types';
import { formatBytes, formatDuration } from '../utils/format';

export { formatBytes, formatDuration };

const CLEANER_IDS = ['cleaner-1', 'cleaner-2', 'cleaner-3', 'cleaner-4'];
const CACHE_KEY = 'fm-cleaner-stats';
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedData {
  stats: Record<string, CleanerStats>;
  timestamp: number;
}

function loadCache(): Record<string, CleanerStats> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.stats;
  } catch {
    return null;
  }
}

function saveCache(stats: Record<string, CleanerStats>): void {
  try {
    const data: CachedData = { stats, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

async function fetchAllStats(): Promise<Record<string, CleanerStats>> {
  const entries = await Promise.allSettled(
    CLEANER_IDS.map(async (id) => {
      const data = await window.electronAPI.getCleanerStats(id);
      return { id, data };
    })
  );

  const result: Record<string, CleanerStats> = {};
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.status === 'fulfilled') {
      result[entry.value.id] = entry.value.data;
    } else {
      result[CLEANER_IDS[i]] = {
        fileCount: 0,
        totalSizeBytes: 0,
        estimatedSeconds: 0,
        categories: [],
        error: true,
      };
    }
  }
  return result;
}

export function useCleanerStats() {
  const cached = useRef(loadCache());
  const [stats, setStats] = useState<Record<string, CleanerStats>>(cached.current ?? {});
  const [loading, setLoading] = useState(!cached.current);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<number>(cached.current ? Date.now() : 0);
  const previousStatsRef = useRef<Record<string, CleanerStats>>(cached.current ?? {});

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const fresh = await fetchAllStats();
        if (cancelled) return;

        previousStatsRef.current = { ...fresh };
        setStats(fresh);
        saveCache(fresh);
        setLastRefreshed(Date.now());
      } catch (err) {
        console.error('Failed to fetch cleaner stats:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const fresh = await fetchAllStats();
      previousStatsRef.current = { ...stats };
      setStats(fresh);
      saveCache(fresh);
      setLastRefreshed(Date.now());
    } catch (err) {
      console.error('Failed to refresh cleaner stats:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [stats]);

  return { stats, loading, isRefreshing, lastRefreshed, refresh, previousStats: previousStatsRef };
}
