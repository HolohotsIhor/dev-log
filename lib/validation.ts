import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in-progress", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  sortBy: z.enum(["priority", "createdAt"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});
