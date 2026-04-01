'use client';

import { useEffect, useRef, useState } from 'react';
import type { Task, CreateTaskInput, TaskStatus, TaskPriority } from '@/lib/types';
import { Button } from './Button';

interface Props {
  initial?: Task;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onClose: () => void;
}

const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export function TaskForm({ initial, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ title, description, status, priority });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl'>
        <h2 className='mb-5 text-lg font-semibold text-slate-800'>
          {initial ? 'Edit task' : 'New task'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Title</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder='What needs to be done?'
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder='Optional details...'
              className='w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className='capitalize'>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className='capitalize'>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className='text-sm text-red-500'>{error}</p>}

          <div className='flex justify-end gap-2 pt-1'>
            <Button variant='ghost' type='button' onClick={onClose}>Cancel</Button>
            <Button
              type='submit'
              variant='primary'
              disabled={loading || !title.trim()}
            >
              {loading ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
