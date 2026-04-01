'use client';

import { useState } from 'react';
import type { Task } from '@/server/types';
import { Button } from './Button';

interface Props {
  task: Task;
  onClose: () => void;
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'result'; update: string }
  | { kind: 'error'; message: string };

export function StatusUpdateModal({ task, onClose }: Props) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [copied, setCopied] = useState(false);

  async function generate() {
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/ai/status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Request failed');
      setState({ kind: 'result', update: data.update });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='text-base'>⊹</span>
            <h2 className='text-lg font-semibold text-slate-800'>Status Update</h2>
          </div>
          <p className='mt-1 line-clamp-1 text-sm text-slate-500'>{task.title}</p>
        </div>

        {state.kind === 'idle' && (
          <div className='space-y-3'>
            <p className='text-sm text-slate-600'>
              The agent will generate a short Slack-style async update based on
              this task and its subtasks.
            </p>
            <div className='flex justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>Cancel</Button>
              <Button variant='primary' onClick={generate}>Generate</Button>
            </div>
          </div>
        )}

        {state.kind === 'loading' && (
          <div className='flex items-center gap-3 py-4 text-sm text-slate-500'>
            <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent' />
            Writing update…
          </div>
        )}

        {state.kind === 'result' && (
          <div className='space-y-4'>
            <div className='rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700'>
              {state.update}
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>Close</Button>
              <Button
                variant='primary'
                className='min-w-[90px]'
                onClick={() => copyToClipboard(state.update)}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        {state.kind === 'error' && (
          <div className='space-y-4'>
            <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'>{state.message}</p>
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
