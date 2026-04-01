'use client';

import type { Task } from '@/server/types';
import { StatusBadge, PriorityBadge } from './Badge';
import { Button } from './Button';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDecompose: (task: Task) => void;
  onStatusUpdate: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onDecompose, onStatusUpdate }: Props) {
  const createdDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <h3 className='truncate font-semibold text-slate-800'>
            {task.title}
          </h3>
          {task.description && (
            <p className='mt-1 line-clamp-2 text-sm text-slate-500'>
              {task.description}
            </p>
          )}
        </div>

        <div className='flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
          <Button variant='compact' onClick={() => onDecompose(task)} title='Decompose with AI'>
            ✦ AI
          </Button>
          <Button variant='compact' onClick={() => onStatusUpdate(task)} title='Generate status update'>
            ⊹ Update
          </Button>
          <Button variant='compact' onClick={() => onEdit(task)}>Edit</Button>
          <Button variant='compactDanger' onClick={() => onDelete(task.id)}>Delete</Button>
        </div>
      </div>

      <div className='mt-3 flex items-center gap-2'>
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {task.subtaskCount > 0 && (
          <span className='inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500'>
            {task.subtaskCount}{' '}
            {task.subtaskCount === 1 ? 'subtask' : 'subtasks'}
          </span>
        )}
        <span className='ml-auto text-xs text-slate-400'>{createdDate}</span>
      </div>
    </div>
  );
}
