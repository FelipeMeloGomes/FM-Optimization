import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { CleanerCategoryStats, CleanerStats } from '../../shared/ipc-types';

interface CategoryPaths {
  label: string;
  paths: string[];
}

const CLEANER_CATEGORIES: Record<string, CategoryPaths[]> = {
  'cleaner-1': [
    {
      label: 'Temp do Usuário',
      paths: [join(process.env.TEMP || '', '*')],
    },
    {
      label: 'Temp do Windows',
      paths: ['C:\\Windows\\Temp\\*'],
    },
    {
      label: 'Prefetch',
      paths: ['C:\\Windows\\Prefetch\\*'],
    },
  ],
  'cleaner-2': [
    {
      label: 'Windows Update',
      paths: [join(process.env.WINDIR || 'C:\\Windows', 'SoftwareDistribution', 'Download', '*')],
    },
    {
      label: 'DirectX Shaders',
      paths: [
        join(process.env.LOCALAPPDATA || '', 'D3DSCache', '*'),
        join(process.env.LOCALAPPDATA || '', 'AMD', 'DxCache', '*'),
        join(process.env.LOCALAPPDATA || '', 'NVIDIA', 'DxCache', '*'),
        join(process.env.LOCALAPPDATA || '', 'Intel', 'ShaderCache', '*'),
      ],
    },
  ],
  'cleaner-3': [
    {
      label: 'Google Chrome',
      paths: [
        join(
          process.env.LOCALAPPDATA || '',
          'Google',
          'Chrome',
          'User Data',
          'Default',
          'Cache',
          '*'
        ),
      ],
    },
    {
      label: 'Microsoft Edge',
      paths: [
        join(
          process.env.LOCALAPPDATA || '',
          'Microsoft',
          'Edge',
          'User Data',
          'Default',
          'Cache',
          '*'
        ),
      ],
    },
    {
      label: 'Mozilla Firefox',
      paths: [
        join(process.env.APPDATA || '', 'Mozilla', 'Firefox', 'Profiles', '*', 'cache2', '*'),
      ],
    },
    {
      label: 'Brave Browser',
      paths: [
        join(
          process.env.LOCALAPPDATA || '',
          'BraveSoftware',
          'Brave-Browser',
          'User Data',
          'Default',
          'Cache',
          '*'
        ),
      ],
    },
  ],
};

CLEANER_CATEGORIES['cleaner-4'] = [
  ...CLEANER_CATEGORIES['cleaner-1'],
  ...CLEANER_CATEGORIES['cleaner-2'],
  ...CLEANER_CATEGORIES['cleaner-3'],
];

const FILES_PER_SECOND = 17;

const CONCURRENCY_LIMIT = 32;

async function scanDirectory(
  dirPath: string,
  maxDepth = 10
): Promise<{ fileCount: number; totalSizeBytes: number }> {
  let fileCount = 0;
  let totalSizeBytes = 0;

  if (maxDepth <= 0) return { fileCount, totalSizeBytes };

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const tasks: Promise<{ fileCount: number; totalSizeBytes: number }>[] = [];

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      tasks.push(
        (async () => {
          try {
            if (entry.isDirectory()) {
              return await scanDirectory(fullPath, maxDepth - 1);
            }
            const s = await stat(fullPath);
            return { fileCount: 1, totalSizeBytes: s.size };
          } catch {
            return { fileCount: 0, totalSizeBytes: 0 };
          }
        })()
      );
    }

    for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
      const batch = tasks.slice(i, i + CONCURRENCY_LIMIT);
      const results = await Promise.all(batch);
      for (const r of results) {
        fileCount += r.fileCount;
        totalSizeBytes += r.totalSizeBytes;
      }
    }
  } catch {
    // skip inaccessible directories
  }

  return { fileCount, totalSizeBytes };
}

function globToDir(globPattern: string): string {
  return globPattern.replace(/[\\/*]$/, '');
}

async function scanCategory(category: CategoryPaths): Promise<CleanerCategoryStats> {
  const scans = category.paths.map((pattern) => scanDirectory(globToDir(pattern)));
  const results = await Promise.allSettled(scans);

  let fileCount = 0;
  let totalSizeBytes = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      fileCount += result.value.fileCount;
      totalSizeBytes += result.value.totalSizeBytes;
    }
  }

  return { label: category.label, fileCount, totalSizeBytes };
}

export async function getCleanerStats(cleanerId: string): Promise<CleanerStats> {
  const categories = CLEANER_CATEGORIES[cleanerId];
  if (!categories) {
    return { fileCount: 0, totalSizeBytes: 0, estimatedSeconds: 0, categories: [] };
  }

  const categoryResults = await Promise.all(categories.map(scanCategory));

  let fileCount = 0;
  let totalSizeBytes = 0;

  for (const cat of categoryResults) {
    fileCount += cat.fileCount;
    totalSizeBytes += cat.totalSizeBytes;
  }

  const estimatedSeconds = Math.ceil(fileCount / FILES_PER_SECOND);

  return {
    fileCount,
    totalSizeBytes,
    estimatedSeconds,
    categories: categoryResults.filter((c) => c.fileCount > 0),
  };
}
