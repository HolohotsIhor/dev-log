import type { TaskStatus, TaskPriority } from "@/lib/types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  "todo":        "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-100 text-blue-700",
  "done":        "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  "todo":        "Todo",
  "in-progress": "In Progress",
  "done":        "Done",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low:    "bg-slate-100 text-slate-500",
  medium: "bg-yellow-100 text-yellow-700",
  high:   "bg-red-100 text-red-600",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}
