'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { StatusBadge, PriorityBadge } from './Badge';
import { Button } from './Button';

interface PrioritizeResult {
  orderedTasks: Task[];
  reasoning: string;
}

interface Props {
  onClose: () => void;
}

export function PrioritizePanel({ onClose }: Props) {
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'result'; data: PrioritizeResult }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  async function run() {
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/ai/prioritize', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Request failed');
      setState({ kind: 'result', data });
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-base'>◈</span>
            <h2 className='text-lg font-semibold text-slate-800'>Plan my day</h2>
          </div>
          <button onClick={onClose} className='cursor-pointer text-slate-400 hover:text-slate-600'>
            ✕
          </button>
        </div>

        {state.kind === 'idle' && (
          <div className='space-y-4'>
            <p className='text-sm text-slate-600'>
              The agent scores your tasks by priority, age, and current status —
              then asks the LLM to review the order and write a short plan for your day.
            </p>
            <div className='flex justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>Cancel</Button>
              <Button variant='primary' onClick={run}>Generate plan</Button>
            </div>
          </div>
        )}

        {state.kind === 'loading' && (
          <div className='flex items-center gap-3 py-4 text-sm text-slate-500'>
            <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent' />
            Analyzing tasks…
          </div>
        )}

        {state.kind === 'result' && (
          <div className='space-y-4'>
            <div className='rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800'>
              {state.data.reasoning}
            </div>

            {state.data.orderedTasks.length === 0 ? (
              <p className='text-sm text-slate-400'>No active tasks to show.</p>
            ) : (
              <ol className='space-y-2'>
                {state.data.orderedTasks.map((task, i) => (
                  <li
                    key={task.id}
                    className='flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5'
                  >
                    <span className='mt-0.5 w-5 shrink-0 text-center text-xs font-semibold text-slate-400'>
                      {i + 1}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium text-slate-800'>{task.title}</p>
                      <div className='mt-1 flex gap-1.5'>
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className='flex justify-end'>
              <Button variant='slate' onClick={onClose}>Done</Button>
            </div>
          </div>
        )}

        {state.kind === 'error' && (
          <div className='space-y-4'>
            <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'>
              {state.message}
            </p>
            <div className='flex justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>Close</Button>
              <Button variant='primary' onClick={() => setState({ kind: 'idle' })}>Retry</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
