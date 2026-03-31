import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from "./types";

export interface TaskFiltersQuery {
  status?: TaskStatus;
  sortBy?: "priority" | "createdAt";
  sortDir?: "asc" | "desc";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  tasks: {
    list(filters: TaskFiltersQuery = {}): Promise<Task[]> {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortDir) params.set("sortDir", filters.sortDir);
      const qs = params.toString();
      return request(`/api/tasks${qs ? `?${qs}` : ""}`);
    },

    get(id: string): Promise<Task> {
      return request(`/api/tasks/${id}`);
    },

    create(input: CreateTaskInput): Promise<Task> {
      return request("/api/tasks", { method: "POST", body: JSON.stringify(input) });
    },

    update(id: string, input: UpdateTaskInput): Promise<Task> {
      return request(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) });
    },

    delete(id: string): Promise<void> {
      return request(`/api/tasks/${id}`, { method: "DELETE" });
    },
  },
};
