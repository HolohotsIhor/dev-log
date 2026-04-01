import type { ButtonHTMLAttributes } from 'react';

const VARIANTS = {
  primary: 'cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50',
  ghost:   'cursor-pointer rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100',
  slate:   'cursor-pointer rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200',
  danger:  'cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50',
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
