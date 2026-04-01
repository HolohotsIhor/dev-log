'use client';

import type { TaskStatus } from '@/server/types';
import type { TaskFiltersQuery } from '@/client/apiClient';

interface Props {
  filters: TaskFiltersQuery;
  onChange: (next: TaskFiltersQuery) => void;
}

const STATUS_OPTIONS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const selectClasses =
  'cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-400 hover:bg-slate-50';

export function Filters({ filters, onChange }: Props) {
  function set<K extends keyof TaskFiltersQuery>(
    key: K,
    value: TaskFiltersQuery[K],
  ) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <select
        value={filters.status ?? ''}
        onChange={(e) => set('status', e.target.value as TaskStatus)}
        className={selectClasses}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.sortBy ?? 'createdAt'}
        onChange={(e) =>
          set('sortBy', e.target.value as 'priority' | 'createdAt')
        }
        className={selectClasses}
      >
        <option value='createdAt'>Sort by date</option>
        <option value='priority'>Sort by priority</option>
      </select>

      <select
        value={filters.sortDir ?? 'desc'}
        onChange={(e) => set('sortDir', e.target.value as 'asc' | 'desc')}
        className={selectClasses}
      >
        <option value='desc'>Desc</option>
        <option value='asc'>Asc</option>
      </select>
    </div>
  );
}
