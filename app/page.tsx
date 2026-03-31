"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type TaskFiltersQuery } from "@/lib/apiClient";
import type { Task } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { Filters } from "@/components/Filters";

type Modal =
  | { kind: "create" }
  | { kind: "edit"; task: Task }
  | { kind: "decompose"; task: Task }
  | null;

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFiltersQuery>({ sortBy: "createdAt", sortDir: "desc" });
  const [modal, setModal] = useState<Modal>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await api.tasks.list(filters));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function handleCreate(data: Parameters<typeof api.tasks.create>[0]) {
    await api.tasks.create(data);
    fetchTasks();
  }

  async function handleUpdate(task: Task, data: Parameters<typeof api.tasks.update>[1]) {
    await api.tasks.update(task.id, data);
    fetchTasks();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    await api.tasks.delete(id);
    fetchTasks();
  }

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">DevLog</h1>
              <p className="mt-0.5 text-sm text-slate-500">Task tracker for engineering teams</p>
            </div>
            <button
              onClick={() => setModal({ kind: "create" })}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              + New task
            </button>
          </div>

          {/* Stats */}
          {!loading && tasks.length > 0 && (
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-slate-500">{todoCount} todo</span>
              <span className="text-blue-600">{inProgressCount} in progress</span>
              <span className="text-green-600">{doneCount} done</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-5">
          <Filters filters={filters} onChange={setFilters} />
        </div>

        {/* Content */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-400">No tasks yet.</p>
            <button
              onClick={() => setModal({ kind: "create" })}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Create your first task
            </button>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setModal({ kind: "edit", task: t })}
                onDelete={handleDelete}
                onDecompose={(t) => setModal({ kind: "decompose", task: t })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.kind === "create" && (
        <TaskForm
          onSubmit={handleCreate}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "edit" && (
        <TaskForm
          initial={modal.task}
          onSubmit={(data) => handleUpdate(modal.task, data)}
          onClose={() => setModal(null)}
        />
      )}

      {/* Decompose modal placeholder — will be implemented in AI step */}
      {modal?.kind === "decompose" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModal(null)}
        >
          <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-xl">
            AI Decompose — coming soon
          </div>
        </div>
      )}
    </main>
  );
}
