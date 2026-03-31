"use client";

import type { Task } from "@/lib/types";
import { StatusBadge, PriorityBadge } from "./Badge";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDecompose: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onDecompose }: Props) {
  const createdDate = new Date(task.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-800">{task.title}</h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onDecompose(task)}
            className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title="Decompose with AI"
          >
            ✦ AI
          </button>
          <button
            onClick={() => onEdit(task)}
            className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        <span className="ml-auto text-xs text-slate-400">{createdDate}</span>
      </div>
    </div>
  );
}
