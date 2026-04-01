'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { Button } from './Button';

interface Props {
  task: Task;
  onClose: () => void;
}

type Step =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'clarifying'; questions: string[] }
  | { kind: 'result'; subtasks: string[] }
  | { kind: 'saved'; subtasks: string[] }
  | { kind: 'error'; message: string };

export function DecomposeModal({ task, onClose }: Props) {
  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [answers, setAnswers] = useState<string[]>([]);

  async function callDecompose(opts: { answers?: string[] } = {}) {
    setStep({ kind: 'loading' });
    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, ...opts }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Request failed');

      if (data.type === 'clarification') {
        setAnswers(new Array(data.questions.length).fill(''));
        setStep({ kind: 'clarifying', questions: data.questions });
        return;
      }

      if (data.type === 'subtasks') {
        setStep({ kind: 'result', subtasks: data.subtasks });
      }
    } catch (err) {
      setStep({ kind: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  async function saveSubtasks(subtasks: string[]) {
    setStep({ kind: 'loading' });
    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, subtasks, save: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Request failed');

      setStep({ kind: 'saved', subtasks });
    } catch (err) {
      setStep({ kind: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  function handleAnswerChange(idx: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='flex w-full max-w-lg flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='text-base'>✦</span>
            <h2 className='text-lg font-semibold text-slate-800'>AI Decompose</h2>
          </div>
          <p className='mt-1 line-clamp-1 text-sm text-slate-500'>{task.title}</p>
        </div>

        {step.kind === 'idle' && (
          <div className='space-y-3'>
            <p className='text-sm text-slate-600'>
              The agent will analyze this task and generate a structured list of subtasks.
              If the description is ambiguous, it will ask clarifying questions first.
            </p>
            <div className='flex justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>Cancel</Button>
              <Button variant='primary' onClick={() => callDecompose()}>Decompose</Button>
            </div>
          </div>
        )}

        {step.kind === 'loading' && (
          <div className='flex items-center gap-3 py-4 text-sm text-slate-500'>
            <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent' />
            Thinking…
          </div>
        )}

        {step.kind === 'clarifying' && (
          <div className='space-y-4'>
            <p className='text-sm text-slate-600'>
              The task needs a bit more context. Please answer these questions:
            </p>
            {step.questions.map((q, i) => (
              <div key={i}>
                <label className='mb-1 block text-sm font-medium text-slate-700'>
                  {i + 1}. {q}
                </label>
                <input
                  value={answers[i] ?? ''}
                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                  placeholder='Your answer…'
                  className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                />
              </div>
            ))}
            <div className='flex justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>Cancel</Button>
              <Button
                variant='primary'
                onClick={() => callDecompose({ answers })}
                disabled={answers.some((a) => !a.trim())}
              >
                Generate subtasks
              </Button>
            </div>
          </div>
        )}

        {step.kind === 'result' && (
          <div className='space-y-4'>
            <ul className='space-y-2'>
              {step.subtasks.map((s, i) => (
                <li key={i} className='flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700'>
                  <span className='mt-0.5 shrink-0 text-slate-400'>{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ul>
            <div className='flex justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>Discard</Button>
              <button
                onClick={() => saveSubtasks(step.subtasks)}
                className='rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700'
              >
                Save subtasks
              </button>
            </div>
          </div>
        )}

        {step.kind === 'saved' && (
          <div className='space-y-4'>
            <div className='flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700'>
              <span>✓</span>
              {step.subtasks.length} subtasks saved
            </div>
            <ul className='space-y-1.5'>
              {step.subtasks.map((s, i) => (
                <li key={i} className='flex items-start gap-2 text-sm text-slate-600'>
                  <span className='shrink-0 text-slate-400'>{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ul>
            <div className='flex justify-end'>
              <Button variant='slate' onClick={onClose}>Done</Button>
            </div>
          </div>
        )}

        {step.kind === 'error' && (
          <div className='space-y-4'>
            <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'>{step.message}</p>
            <div className='flex justify-end gap-2'>
              <Button variant='ghost' onClick={onClose}>Close</Button>
              <Button variant='primary' onClick={() => setStep({ kind: 'idle' })}>Retry</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
