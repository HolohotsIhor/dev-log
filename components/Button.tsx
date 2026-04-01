import type { ButtonHTMLAttributes } from 'react';

const VARIANTS = {
  primary:       'cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50',
  ghost:         'cursor-pointer rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100',
  slate:         'cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200',
  danger:        'cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50',
  outline:       'cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50',
  compact:       'cursor-pointer rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700',
  compactDanger: 'cursor-pointer rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600',
  link:          'cursor-pointer text-sm text-blue-600 hover:underline',
  icon:          'cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600',
} as const;

type Variant = keyof typeof VARIANTS;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'ghost', className, children, ...props }: Props) {
  const base = VARIANTS[variant];
  return (
    <button className={className ? `${base} ${className}` : base} {...props}>
      {children}
    </button>
  );
}
